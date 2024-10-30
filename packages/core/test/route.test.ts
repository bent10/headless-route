/// <reference types="vitest/globals" />

import {
  createRoute,
  createRoutesSync,
  findRoute,
  routeSegments
} from '../src/index.js'

it('should create correct segments', () => {
  const segments = routeSegments('foo/bar/baz.html', 'foo')

  expect(segments).toEqual(['bar', 'baz'])
})

it('should create a base route', () => {
  const route = createRoute('pages/foo/bar', {
    root: 'pages'
  })

  expect(route).toMatchInlineSnapshot(`
    {
      "id": "pages/foo/bar",
      "index": false,
      "isDynamic": false,
      "stem": "foo/bar",
      "url": "/foo/bar",
    }
  `)

  const nonEnumProps = ['isMatch', 'matchParams', 'generatePath'].map(prop =>
    Object.prototype.hasOwnProperty.call(route, prop)
  )

  expect(nonEnumProps).toEqual([false, false, false])
})

it('should create a base route with relative url prefix', () => {
  const route = createRoute('pages/foo/bar', {
    root: 'pages',
    urlPrefix: './docs'
  })

  expect(route).toMatchInlineSnapshot(`
    {
      "id": "pages/foo/bar",
      "index": false,
      "isDynamic": false,
      "stem": "foo/bar",
      "url": "./docs/foo/bar",
    }
  `)
})

it('should create a base route with absolute url prefix', () => {
  const route = createRoute('pages/foo/bar', {
    root: 'pages',
    urlPrefix: '/docs'
  })

  expect(route).toMatchInlineSnapshot(`
    {
      "id": "pages/foo/bar",
      "index": false,
      "isDynamic": false,
      "stem": "foo/bar",
      "url": "/docs/foo/bar",
    }
  `)
})

it('should create a base route with full url prefix', () => {
  const route = createRoute('pages/foo/bar', {
    root: 'pages',
    urlPrefix: 'https://example.com/'
  })

  expect(route).toMatchInlineSnapshot(`
    {
      "id": "pages/foo/bar",
      "index": false,
      "isDynamic": false,
      "stem": "foo/bar",
      "url": "https://example.com/foo/bar",
    }
  `)
})

it('should create a base route with empty string prefix', () => {
  const route = createRoute('pages/foo/bar', {
    root: 'pages',
    urlPrefix: ''
  })

  expect(route).toMatchInlineSnapshot(`
    {
      "id": "pages/foo/bar",
      "index": false,
      "isDynamic": false,
      "stem": "foo/bar",
      "url": "./foo/bar",
    }
  `)
})

it('should create a dynamic route', () => {
  const route = createRoute('pages/foo/:bar', {
    root: 'pages'
  })

  expect(route).toMatchInlineSnapshot(`
    {
      "id": "pages/foo/:bar",
      "index": false,
      "isDynamic": true,
      "stem": "foo/:bar",
      "url": "/foo/:bar",
    }
  `)

  const nonEnumProps = ['isMatch', 'matchParams', 'generatePath'].map(prop =>
    Object.prototype.hasOwnProperty.call(route, prop)
  )

  expect(nonEnumProps).toEqual([true, true, true])
})

it.skip('should create optional dynamic routes', () => {
  const files: string[] = ['pages/:a?/:b', 'pages/$c+/$d*', 'pages/:e/[f]']
  const routes = files.map(file =>
    createRoute(file, { root: 'pages', urlSuffix: '.html' })
  )

  expect(routes).toMatchInlineSnapshot(`
    [
      {
        "id": "pages/:a?/:b",
        "index": false,
        "isDynamic": true,
        "stem": ":a?/:b",
        "url": "{/:a}?/:b.html",
      },
      {
        "id": "pages/$c+/$d*",
        "index": false,
        "isDynamic": true,
        "stem": ":c+/:d*",
        "url": "{/:c}+{/:d}*.html",
      },
      {
        "id": "pages/:e/[f]",
        "index": false,
        "isDynamic": true,
        "stem": ":e/:f?",
        "url": "/:e{/:f}?.html",
      },
    ]
  `)

  routes.forEach(route => {
    const nonEnumProps = ['isMatch', 'matchParams', 'generatePath'].map(prop =>
      Object.prototype.hasOwnProperty.call(route, prop)
    )

    expect(nonEnumProps).toEqual([true, true, true])
  })
})

it('should find a base route from routes object based on the request URL', () => {
  const routes = createRoutesSync({ dir: 'example' })

  const route = findRoute('/blogs/foo', routes)
  const notFountRoute = findRoute('/missing', routes)

  expect(route).toMatchInlineSnapshot(`
    {
      "id": "example/blogs/$slug.md",
      "index": false,
      "isDynamic": true,
      "stem": "blogs/:slug",
      "url": "/blogs/:slug",
    }
  `)
  expect(notFountRoute).toBeUndefined()
})

it.skip('should find a dynamic route from routes object based on the request URL', () => {
  const config = { root: 'pages' }
  const routes = [
    // dynamic segments
    createRoute('pages/teams/:id.md', config),
    // multiple dynamic segments
    createRoute('pages/products/:cat/p/:id.md', config),
    // optional segments
    createRoute('pages/:lang?/group.md', config)
  ]

  // match dynamic segments
  expect(findRoute('/teams', routes)).toBeUndefined()
  expect(findRoute('/teams/123', routes)).toEqual(routes[0])
  expect(findRoute('/teams/foo', routes)).toEqual(routes[0])

  const route = findRoute('/teams/foo', routes)
  if (route?.isDynamic) {
    const params = route.matchParams('/teams/foo')

    expect(params).toEqual({ id: 'foo' })
  }

  // match multiple dynamic segments
  expect(findRoute('/products', routes)).toBeUndefined()
  expect(findRoute('/products/men', routes)).toBeUndefined()
  expect(findRoute('/products/men/p', routes)).toBeUndefined()
  expect(findRoute('/products/men/p/123', routes)).toEqual(routes[1])
  expect(findRoute('/products/men/p/foo', routes)).toEqual(routes[1])

  const mRoute = findRoute('/products/men/p/foo', routes)
  if (mRoute?.isDynamic) {
    const params = mRoute.matchParams('/products/men/p/foo')

    expect(params).toEqual({ cat: 'men', id: 'foo' })
  }
})

it.skip('should find an optional route from routes object based on the request URL', () => {
  const config = { root: 'pages' }
  const routes = [
    // optional segments
    createRoute('pages/:lang?/group.md', config),
    // multiple optional segments
    createRoute('pages/contact/:group?/u/[id].md', config)
  ]

  // match optional segments
  expect(findRoute('/group', routes)).toEqual(routes[0])
  expect(findRoute('/id/group', routes)).toEqual(routes[0])
  expect(findRoute('/en/group', routes)).toEqual(routes[0])

  const route = findRoute('en/group', routes)
  if (route?.isDynamic) {
    const params = route.matchParams('en/group')

    expect(params).toEqual({ lang: 'en' })
  }

  // match multiple optional segments
  expect(findRoute('/contact', routes)).toBeUndefined()
  expect(findRoute('/contact/work', routes)).toBeUndefined()
  expect(findRoute('/contact/u', routes)).toEqual(routes[1])
  expect(findRoute('/contact/work/u', routes)).toEqual(routes[1])
  expect(findRoute('/contact/work/u/123', routes)).toEqual(routes[1])
  expect(findRoute('/contact/work/u/foo', routes)).toEqual(routes[1])

  const mRoute = findRoute('/contact/work/u/foo', routes)
  if (mRoute?.isDynamic) {
    const params = mRoute.matchParams('/contact/work/u/foo')

    expect(params).toEqual({ group: 'work', id: 'foo' })
  }
})

it.skip('should find a splats route from routes object based on the request URL', () => {
  const config = { root: 'pages' }
  const routes = [
    // wildcard route
    createRoute('pages/files/*.md', config),
    // zero or more parameters
    createRoute('pages/foo/:ids*.md', config),
    // one or more parameters
    createRoute('pages/bar/:ids+.md', config)
  ]

  // match wildcard route
  expect(findRoute('/files', routes)).toBeUndefined()
  expect(findRoute('/files/', routes)).toEqual(routes[0])
  expect(findRoute('/files/a', routes)).toEqual(routes[0])
  expect(findRoute('/files/a/b', routes)).toEqual(routes[0])
  expect(findRoute('/files/a/b/123', routes)).toEqual(routes[0])

  const wildcardRoute = findRoute('/files/a/b/123', routes)
  if (wildcardRoute?.isDynamic) {
    const params = wildcardRoute.matchParams('/files/a/b/123')

    expect(params).toEqual({ '0': ['a', 'b', '123'] })
  }

  // zero or more parameter matches
  expect(findRoute('/foo', routes)).toEqual(routes[1])
  expect(findRoute('/foo/a', routes)).toEqual(routes[1])
  expect(findRoute('/foo/a/b', routes)).toEqual(routes[1])
  expect(findRoute('/foo/a/b/123', routes)).toEqual(routes[1])

  const namedSplatsRoute = findRoute('/foo/a/b/123', routes)
  if (namedSplatsRoute?.isDynamic) {
    const params = namedSplatsRoute.matchParams('/foo/a/b/123')

    expect(params).toEqual({ ids: ['a', 'b', '123'] })
  }

  // one or more parameter matches
  expect(findRoute('/bar', routes)).toBeUndefined()
  expect(findRoute('/bar/a', routes)).toEqual(routes[2])
  expect(findRoute('/bar/a/b', routes)).toEqual(routes[2])
  expect(findRoute('/bar/a/b/123', routes)).toEqual(routes[2])

  const requiredSplatsRoute = findRoute('/bar/a/b/123', routes)
  if (requiredSplatsRoute?.isDynamic) {
    const params = requiredSplatsRoute.matchParams('/bar/a/b/123')

    expect(params).toEqual({ ids: ['a', 'b', '123'] })
  }
})

it.skip('should fail to match dynamic route params', () => {
  const route = createRoute('pages/blogs/:slug', {
    root: 'pages'
  })

  if (route?.isDynamic) {
    const params = route.matchParams('/blogs/foo/bar')

    expect(params).toBe(false)
  } else {
    expect.fail()
  }
})

it('should generate a dynamic route path', () => {
  const route = createRoute('pages/blogs/:slug', {
    root: 'pages',
    urlSuffix: '.html'
  })

  if (route?.isDynamic) {
    const urlpath = route.generatePath({ slug: 'bar' })

    expect(urlpath).toBe('/blogs/bar.html')
  } else {
    expect.fail()
  }
})

it('should match encoded paths correctly', () => {
  const route = createRoute('pages/café.md', {
    root: 'pages'
  })
  // possible ways of writing `/café`:
  const reqs = ['/caf\u00E9', '/cafe\u0301', '/caf%C3%A9', '/café']

  reqs.forEach(req => expect(findRoute(req, [route])).toEqual(route))
})
