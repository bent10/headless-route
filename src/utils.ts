import { readGitignore } from 'gitignore-reader'
import _ignore, { type Ignore, type Options as IgOptions } from 'ignore'

type IgnoreFn = (options?: IgOptions) => Ignore

const ignore = (_ignore as unknown as IgnoreFn)().add(readGitignore())

/**
 * Checks if a given path is ignored according to the rules specified in the
 * project's `.gitignore` file.
 *
 * @param id The id to check for ignoring.
 * @returns A boolean indicating whether the id is ignored.
 */
export function isIgnored(id: string) {
  return ignore.ignores(id)
}

/**
 * Escapes special characters in a string to be used as a regular expression
 * pattern.
 *
 * @param str - The input string or value to escape.
 * @returns The escaped string with special characters replaced by their escaped
 *   counterparts.
 */
export function escapeRegExp(str: string) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
}
