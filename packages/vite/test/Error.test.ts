/// <reference types="vitest/globals" />

import { HttpError } from '../src/Error.js'

describe('HttpError', () => {
  it('should create an instance of HttpError', () => {
    const error = new HttpError(404, 'Not Found')
    expect(error instanceof HttpError).toBe(true)
  })

  it('should have the correct status and message properties', () => {
    const status = 404
    const message = 'Not Found'
    const error = new HttpError(status, message)
    expect(error.status).toBe(status)
    expect(error.message).toBe(message)
  })

  it('should have the correct name property', () => {
    const error = new HttpError(404, 'Not Found')
    expect(error.name).toBe('HTTPError')
  })

  it('should have the correct stack trace', () => {
    const error = new HttpError(404, 'Not Found')
    expect(error.stack).toBeDefined()
  })
})
