import type { Store } from './types.js'

/**
 * A class for storing key-value pairs in memory cache.
 *
 * @template V - The type of value stored in the store.
 * @todo Refactor to implement [Web Cache interface](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
 */
export class InMemoryStore<V = unknown> {
  /** @private */
  #store: Store<V> = {}

  /**
   * Sets a key-value pair in the store.
   *
   * @param key - The key of the pair.
   * @param value - The value of the pair.
   */
  set(key: string, value: V) {
    this.#store[key] = value
  }

  /**
   * Retrieves the value associated with the provided key.
   *
   * @param key - The key to retrieve the value for.
   * @returns The value associated with the key, if present.
   */
  get(key: string): V {
    return this.#store[key]
  }

  /**
   * Checks if the store contains a value associated with the provided key.
   *
   * @param key - The key to check for existence.
   * @returns A boolean indicating whether the store contains the key.
   */
  has(key: string): boolean {
    return key in this.#store
  }

  /**
   * Deletes the key-value pair associated with the provided key from the store.
   *
   * @param key - The key of the pair to delete.
   */
  delete(key: string) {
    delete this.#store[key]
  }

  /**
   * Removes all key-value pairs from the store that have keys starting with the
   * specified prefix.
   *
   * @param prefixKey - The prefix of the keys to be removed.
   */
  flush(prefixKey: string = '') {
    if (!prefixKey) return this.clear()

    for (const key in this.#store) {
      if (key.startsWith(prefixKey)) {
        this.delete(key)
      }
    }
  }

  /**
   * Clears all key-value pairs from the store.
   */
  clear() {
    this.#store = {}
  }

  /**
   * Retrieves the number of key-value pairs stored in the store.
   *
   * @returns The number of key-value pairs in the store.
   */
  size(): number {
    return this.keys().length
  }

  /**
   * Retrieves an array of all keys stored in the store.
   *
   * @returns An array containing all keys stored in the store.
   */
  keys(): string[] {
    return Object.keys(this.#store)
  }

  /**
   * Retrieves an array of all values stored in the store.
   *
   * @returns An array containing all values stored in the store.
   */
  values() {
    return Object.values(this.#store)
  }

  /**
   * Retrieves an array of key-value pairs stored in the store.
   *
   * @returns An array containing all key-value pairs stored in the store.
   */
  entries() {
    return Object.entries(this.#store)
  }
}

/**
 * Provides in-memory cache for storing key-value pairs during development.
 */
export const devCache = new InMemoryStore<string>()
