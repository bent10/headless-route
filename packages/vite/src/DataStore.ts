import fs from 'fast-glob'
import { routeSegments } from 'headless-route'
import { loadFile } from 'loadee'
import setValue from 'set-value'
import { InMemoryStore } from './Cache.js'
import type { DataExtension, DataStoreOptions } from './types.js'
import { actionLog, deepFreeze, deepUnfreeze } from './utils.js'

/**
 * Represents a data manager that loads, manages, and merges data from
 * various sources. This class extends the `Map` class and provides additional
 * methods for handling data.
 *
 * @template V - The type of value stored in the store.
 */
export class DataStore<V = unknown> extends InMemoryStore<V> {
  /**
   * Allowed file extensions for data sources.
   */
  static ALLOWED_EXTS: DataExtension[] = [
    '.json',
    '.yml',
    '.yaml',
    '.js',
    '.mjs',
    '.cjs'
  ]

  /**
   * Configuration options for the data.
   */
  config: Required<DataStoreOptions> = {
    dir: 'data',
    extensions: DataStore.ALLOWED_EXTS,
    localDataDir: '',
    localDataSuffix: '.data',
    merge: true,
    ignore: []
  }

  /**
   * Constructs a new Data instance.
   *
   * @param options - Options for configuring the data.
   */
  constructor(options: DataStoreOptions = {}) {
    super()

    Object.assign(this.config, options)
  }

  /**
   * The source glob patterns for data files.
   */
  get source() {
    const { dir, extensions, localDataDir, localDataSuffix } = this.config
    const exts = `(${extensions.map(e => e.replace(/^\./, '')).join('|')})`

    const source = [`${dir.replace(/[\/\\]+$/, '')}/**/*.${exts}`]

    if (localDataDir) {
      source.push(
        `${localDataDir.replace(/[\/\\]+$/, '')}/**/*${localDataSuffix}.${exts}`
      )
    }

    return source
  }

  /**
   * The array of data source files.
   */
  get datasources() {
    return fs.sync(this.source, {
      ignore: this.config.ignore,
      onlyFiles: true
    })
  }

  /**
   * Checks if the provided file ID has a valid extension based on the configured
   * extensions.
   *
   * @param id - The file ID to check.
   * @returns A boolean indicating whether the file has a valid extension.
   */
  hasValidExtension(id: string) {
    return this.config.extensions.some(ext => id.endsWith(ext))
  }

  /**
   * Checks if a file is a data source.
   *
   * @param id - The ID of the file to check.
   * @returns `true` if the file is a data source, otherwise `false`.
   */
  isDataSource(id: string) {
    return this.isGlobalDataSource(id) || this.isLocalDataSource(id)
  }

  /**
   * Checks if a file is a global data source.
   *
   * @param id - The ID of the file to check.
   * @returns `true` if the file is a global data source, otherwise `false`.
   */
  isGlobalDataSource(id: string) {
    return (
      this.config.dir &&
      id.startsWith(this.config.dir) &&
      this.hasValidExtension(id)
    )
  }

  /**
   * Checks if a file is a local data source.
   *
   * @param id - The ID of the file to check.
   * @returns `true` if the file is a local data source, otherwise `false`.
   */
  isLocalDataSource(id: string) {
    return (
      this.config.dir &&
      id.startsWith(this.config.localDataDir) &&
      this.hasValidExtension(id)
    )
  }

  /**
   * Initializes the data manager by loading data from files.
   *
   * @throws Error if an error occurs during data loading.
   */
  async init() {
    try {
      const datasources = this.datasources

      this.clear()

      for (const id of datasources) {
        const data = await this.load(id)
        this.set(id, data)
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Loads data from a file.
   *
   * @param id - The ID of the file to load.
   * @returns The loaded data.
   */
  async load(id: string) {
    return (await loadFile(id)) as V
  }

  /**
   * Sets a key-value pair in the DataStore instance.
   *
   * @param key - The ID of the data.
   * @param value - The data value.
   * @returns The DataStore instance.
   */
  set(key: string, value: V) {
    super.set(key, this.#freeze(value))

    actionLog(key, 'set')

    return this
  }

  delete(key: string) {
    const isDeleted = super.delete(key)

    actionLog(key, 'delete')

    return isDeleted
  }

  /**
   * Merges all global data sources into a single object.
   *
   * @returns The merged data.
   */
  join<T extends object = object>() {
    const mergedData = {} as T
    const entries = this.entries()

    for (const [id, value] of entries) {
      if (id.startsWith(this.config.dir)) {
        const segments = routeSegments(id, this.config.dir)

        setValue(mergedData, segments, this.#unfreeze(value), {
          merge: this.config.merge
        })
      }
    }

    return mergedData
  }

  /**
   * Retrieves data for a specific route URL.
   *
   * @param url - The route URL.
   * @param suffix - The suffix of the given `url`.
   * @returns The data associated with the route URL.
   */
  getRouteData<T extends object = object>(url: string, suffix = '') {
    if (url.endsWith(suffix)) {
      const escapedSuffix = suffix.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
      url = url.replace(new RegExp(`${escapedSuffix}$`), '')
    }

    const segments = url.split('/').filter(Boolean)
    const { extensions, localDataDir, localDataSuffix } = this.config
    const mergedData = {} as T

    // always load root local data if exists
    extensions.forEach(ext => {
      const name = localDataDir.split('/').pop()!
      const rootLocalDataId = `${localDataDir}/${name + localDataSuffix + ext}`

      if (this.has(rootLocalDataId)) {
        Object.assign(mergedData, this.#unfreeze(this.get(rootLocalDataId)!))
      }
    })

    let currSegment = localDataDir

    segments.forEach(segment => {
      currSegment += segment === 'index' ? '' : `/${segment}`

      extensions.forEach(ext => {
        const name =
          segment === 'index'
            ? `/${'index' + localDataSuffix + ext}`
            : `/${segment + localDataSuffix + ext}`
        const id = currSegment + name

        if (this.has(id)) {
          Object.assign(mergedData, this.#unfreeze(this.get(id)!))
        }
      })
    })

    return mergedData
  }

  /**
   * Dumps the configuration and data sources as a JSON string.
   *
   * @returns A JSON string representing the configuration and data sources.
   */
  dump() {
    return JSON.stringify(
      {
        config: this.config,
        source: this.source,
        datasources: this.datasources,
        entries: this.entries()
      },
      null,
      2
    )
  }

  /**
   * Recursively freezes the given value if it is an object.
   */
  #freeze(value: V): V {
    return typeof value === 'object' ? <V>deepFreeze(value as object) : value
  }

  /**
   * Recursively unfreezes the given value if it is an object.
   */
  #unfreeze(value: Readonly<V>) {
    return typeof value === 'object' ? deepUnfreeze(value) : value
  }
}
