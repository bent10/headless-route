/// <reference types="vitest/globals" />

import { InMemoryStore, devCache } from '../src/Cache.js'

describe('InMemoryStore', () => {
  let store: InMemoryStore

  beforeEach(() => {
    store = new InMemoryStore()
  })

  it('should set and get a key-value pair', () => {
    store.set('key', 'value')
    expect(store.get('key')).toBe('value')
  })

  it('should return undefined for non-existent keys', () => {
    expect(store.get('nonexistent')).toBeUndefined()
  })

  it('should check if a key exists', () => {
    store.set('existing', 'value')
    expect(store.has('existing')).toBe(true)
    expect(store.has('nonexistent')).toBe(false)
  })

  it('should delete a key-value pair', () => {
    store.set('key', 'value')
    store.delete('key')
    expect(store.has('key')).toBe(false)
  })

  it('should flush keys with a specified prefix', () => {
    store.set('prefix1_key1', 'value1')
    store.set('prefix1_key2', 'value2')
    store.set('prefix2_key1', 'value3')
    store.flush('prefix1_')
    expect(store.keys()).toEqual(['prefix2_key1'])
  })

  it('should clear all key-value pairs', () => {
    store.set('key1', 'value1')
    store.set('key2', 'value2')
    store.clear()
    expect(store.size()).toBe(0)
  })

  it('should retrieve the number of key-value pairs', () => {
    store.set('key1', 'value1')
    store.set('key2', 'value2')
    expect(store.size()).toBe(2)
  })

  it('should retrieve an array of keys', () => {
    store.set('key1', 'value1')
    store.set('key2', 'value2')
    expect(store.keys()).toEqual(['key1', 'key2'])
  })

  it('should retrieve an array of values', () => {
    store.set('key1', 'value1')
    store.set('key2', 'value2')
    expect(store.values()).toEqual(['value1', 'value2'])
  })

  it('should retrieve an array of key-value pairs', () => {
    store.set('key1', 'value1')
    store.set('key2', 'value2')
    expect(store.entries()).toEqual([
      ['key1', 'value1'],
      ['key2', 'value2']
    ])
  })
})

describe('devCache', () => {
  it('should be an instance of InMemoryStore', () => {
    expect(devCache instanceof InMemoryStore).toBe(true)
  })
})
