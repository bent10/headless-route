import type { Plugin } from 'vite'
import { headlessRoute } from './loader.js'
import build from './build.js'
import serve from './serve.js'
import type { HeadlessRouteOptions } from './types.js'

/**
 * A Vite plugin for headless routes handling, including loading data, building
 * routes, and serving routes during development.
 *
 * @param options - Options for configuring the headless routes plugin.
 * @returns An array of Vite plugins.
 */
export default function pluginHeadlessRoute(
  options?: HeadlessRouteOptions
): Plugin[] {
  return [headlessRoute(options), build(), serve()]
}

export { devCache } from './Cache.js'
export type * from './types.js'
