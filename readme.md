# Headless Route

A utility to help generate routes for a Multi-Page Application (MPA) based on the file structure of a directory. It offers functions to create routes and navigation routes from the directory structure, allowing for easy navigation and dynamic routing.

## Install

To use `headless-route` in your project, you can install it via npm or yarn:

```bash
npm i -D headless-route
# or
yarn add -D headless-route
```

## Usage

Say we have the following directory structure. Refer to the `example` directory for further details:

```bash
./
├── pages/
│   ├── 404.md                # => /404.html
│   ├── about.md              # => /about.html
│   ├── blogs/
│   │   ├── api.js            # => the blogs api
│   │   └── :slug.md          # => /blogs/:slug
│   ├── contact.md            # => /contact.html
│   ├── _hidden/
│   │   └── hidden-page.md
│   └── index.md              # => /
├── ...
├── package-lock.json
└── package.json
```

▸ Create routes based on a directory structure:

```js
import { createRoutes } from 'headless-route'
// Or for CommonJS:
// const { createRoutes } = require('headless-route')

const routes = await createRoutes({
  dir: 'pages',
  extensions: ['.html', '.md'],
  urlSuffix: '.html',
  filter(file) {
    // ignore files starting with '_'
    return !file.name.startsWith('_')
  },
  async handler(route) {
    if (route.isDynamic) {
      const dirname = route.id.split('/').slice(0, -1).join('/')
      const apifile = `./${dirname}/api.js`
      const { fetchApi } = await import(apifile)

      route.context = await fetchApi()
    }
  }
})
// for sync api:
// const routes = createRoutesSync({...})

console.log(routes)
```

<details>
<summary>Yields:</summary>

```js
;[
  {
    id: 'pages/404.md',
    stem: '404',
    url: '/404.html',
    index: false,
    isDynamic: false
  },
  {
    id: 'pages/about.md',
    stem: 'about',
    url: '/about.html',
    index: false,
    isDynamic: false
  },
  {
    id: 'pages/blogs/$slug.md',
    stem: 'blogs/:slug',
    url: '/blogs/:slug.html',
    index: false,
    isDynamic: true,
    context: { foo: [Object], bar: [Object] }
  },
  {
    id: 'pages/contact.md',
    stem: 'contact',
    url: '/contact.html',
    index: false,
    isDynamic: false
  },
  {
    id: 'pages/foo/bar/baz/index.md',
    stem: 'foo/bar/baz/index',
    url: '/foo/bar/baz/index.html',
    index: true,
    isDynamic: false
  },
  {
    id: 'pages/foo/bar/index.md',
    stem: 'foo/bar/index',
    url: '/foo/bar/index.html',
    index: true,
    isDynamic: false
  },
  {
    id: 'pages/foo/index.md',
    stem: 'foo/index',
    url: '/foo/index.html',
    index: true,
    isDynamic: false
  },
  {
    id: 'pages/index.md',
    stem: 'index',
    url: '/index.html',
    index: true,
    isDynamic: false
  }
]
```

</details>

▸ Create navigation routes from routes:

```js
import { createNavigation } from 'headless-route'
// Or for CommonJS:
// const { createNavigation } = require('headless-route')

const navigationRoutes = await createNavigation(routes)
// for sync api:
// const navigationRoutes = createNavigationSync(routes)

console.log(navigationRoutes)
```

<details>
<summary>Yields:</summary>

```js
;[
  {
    stem: '404',
    url: '/404.html',
    index: false,
    isDynamic: false
  },
  {
    stem: 'about',
    url: '/about.html',
    index: false,
    isDynamic: false
  },
  {
    stem: 'blogs',
    url: '/blogs',
    index: true,
    isDynamic: false,
    children: [
      {
        stem: 'blogs/:slug',
        url: '/blogs/:slug.html',
        index: false,
        isDynamic: true,
        context: {
          foo: [Object],
          bar: [Object]
        }
      }
    ]
  },
  {
    stem: 'contact',
    url: '/contact.html',
    index: false,
    isDynamic: false
  },
  {
    stem: 'foo',
    url: '/foo',
    index: true,
    isDynamic: false,
    children: [
      {
        stem: 'foo/bar',
        url: '/foo/bar',
        index: true,
        isDynamic: false,
        children: [
          {
            stem: 'foo/bar/baz',
            url: '/foo/bar/baz',
            index: true,
            isDynamic: false,
            children: [
              {
                stem: 'foo/bar/baz/index',
                url: '/foo/bar/baz/index.html',
                index: true,
                isDynamic: false
              }
            ]
          },
          {
            stem: 'foo/bar/index',
            url: '/foo/bar/index.html',
            index: true,
            isDynamic: false
          }
        ]
      },
      {
        stem: 'foo/index',
        url: '/foo/index.html',
        index: true,
        isDynamic: false
      }
    ]
  },
  {
    stem: 'index',
    url: '/index.html',
    index: true,
    isDynamic: false
  }
]
```

</details>

> [!NOTE]
> In navigation routes, a file named `index` serves as a Layout routes. It participates in UI nesting, but it does not add any segments to the URL.

▸ Finds a route that matches the provided request URL:

```js
import { findRoute } from 'headless-route'

const requestUrl = '/blogs/foo.html'
const route = findRoute(requestUrl, routes)

if (route?.isDynamic) {
  // match params
  const params = route.matchParams(requestUrl)
  // yields: { slug: foo }

  // generate url path
  const urlpath = route.generatePath({ slug: 'bar' })
  // yields: /blogs/bar.html
}
```

## Best practices

When structuring your project, adhere to the following best practices:

▸ Files or directories starting with an underscore character (`_`) should be ignored:

```js
const routes = await createRoutes({
  filter(file) {
    // ignore files starting with '_'
    return !file.name.startsWith('_')
  }
})
```

▸ File or directory names starting with a dollar character (`$`) or colon (`:`), or conclude with a question mark (`?`), or are enclosed within square brackets (`[]`), will be treated as “dynamic segments”.

> [!CAUTION]
> Please note that the colon (`:`) and question mark (`?`) characters are
> invalid for file names on Windows.

▸ Dynamic segments should adhere to the following formatting guidelines:

- 🚫 Avoid: `/users-:id.md` (partial paths should be avoided)
- ✅ Prefer: `/users/:id.md` or `/users/$id.md`
- ✅ Acceptable: `/users/:id?.md` or `/users/[id].md` (for optional segments)
- 🚫 Avoid: `/posts/:categories--:id.md` (partial paths should be avoided)
- ✅ Prefer: `/posts/:categories/:id.md` or `/posts/$categories/$id.md`
- ✅ Acceptable: `/posts/[lang]/categories.md` (for optional segments)
- ✅ Acceptable: `/files/*.md` (for splat segments)
- ✅ Acceptable: `/foo/:bar*.md` (for named splat segments)
- ✅ Acceptable: `/foo/:bar+.md` (for required splat segments)

▸ Follow a consistent pattern in CRUD operations. Instead of naming files like `foo/$id.edit.tsx`, use `foo/$id/edit.tsx`:

🚫 Avoid:

- `pages/users/$id.create.tsx`
- `pages/users/$id.edit.tsx`
- `pages/users/$id.delete.tsx`
- `pages/users/$id.view.tsx`

✅ Prefer:

- `pages/users/$id/create.tsx`
- `pages/users/$id/edit.tsx`
- `pages/users/$id/delete.tsx`
- `pages/users/$id/view.tsx`
- `pages/users/api.ts`
- `pages/users/index.tsx`

## API

### `createRoutes(options: Options): Promise<Route[]>`

Creates routes based on the specified `options`:

- `dir`: The directory to scan for routes. Defaults to the current working directory (`process.cwd()`).
- `extensions`: The file extensions to include when scanning for routes. Defaults (`['.html', '.md', '.js']`).
- `urlSuffix`: The suffix to append to route URLs. Defaults to an empty string.
- `cache`: Indicates whether to cache routes. Defaults to `false`.
- `filter`: A filter function for filtering [`Dirent`](https://nodejs.org/api/fs.html#class-fsdirent) objects. It automatically disregards files and directories listed in the project's `.gitignore` file, ensuring they are consistently excluded from consideration.

  ```js
  const routes = await createRoutes({
    filter(file) {
      // ignore files starting with '_' or ending with '.data.js'
      return !file.name.startsWith('_') && !file.name.endsWith('.data.js')
    }
  })
  ```

- `handler`: A handler function called for each route.

  ```js
  await createRoutes({
    dir: 'pages',
    async handler(route) {
      if (route.id.endsWith('.js')) {
        // attach a lazy route for JavaScript files
        route.lazy = import(route.id)
      }
    }
  })
  ```

### `createRoutesSync(options: OptionsSync): Route[]`

Creates routes based on the specified options synchronously.

### `createNavigation(routes: Route[], handler?: NavigationHandlerFn): Promise<NavigationRoute[]>`

Creates navigation routes based on the specified routes. A navigation route object has the same structure as a route object, excluding the `id` property. It may also contain `children` property, representing the children routes of the navigation route.

- `routes`: An array of routes.
- `handler?`: A navigation route handler function.

```js
const navigationRoutes = await createNavigation(routes, route => {
  const segments = route.stem.split('/')
  const lastSegment = String(segments.pop())

  // assign 'text' prop for each route and layout routes
  Object.assign(route, {
    text: lastSegment[0].toUpperCase() + lastSegment.slice(1).toLowerCase()
  })
})
```

### `createNavigationSync(routes: Route[], handler?: NavigationHandlerFnSync): NavigationRoute[]`

Creates navigation routes based on the specified routes synchronously.

### `createRoute(id: string, options: { root: string, urlPrefix: string }): Route`

A utility to create a route object based on the provided ID and options.

```js
import { createRoute } from 'headless-route'

const route = createRoute('pages/users/:id.md', {
  root: 'pages',
  urlSuffix: '.html'
})

// Yields:
// { id: 'pages/users/$id.md', stem: 'users/:id', url: '/users/:id.html', index: false, isDynamic: true }
```

### `findRoute(requestUrl: string, routes: Route[]): Route | undefined`

A utility to Find a route that matches the provided request URL.

```js
import { findRoute } from 'headless-route'

const matchedRoute = findRoute('/contact.html', routes)

// Yields:
// { id: 'pages/contact.md', stem: 'contact', url: '/contact.html', index: false, isDynamic: false }
```

## Types

### `Route<Context>`

Represents a single route in the MPA.

<details>
<summary>Types:</summary>

```ts
/**
 * Represents a route, which can be either a base route or a dynamic route.
 *
 * @template Context The type of additional context data associated with the route.
 */
export type Route<Context extends object = object> =
  | BaseRoute<Context>
  | DynamicRoute<Context>

/**
 * Represents the base structure of a route.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface BaseRoute<Context extends object = object> {
  /**
   * The unique identifier for the route.
   */
  id: string

  /**
   * The stem of the route URL.
   */
  stem: string

  /**
   * The URL of the route.
   */
  url: string

  /**
   * Indicates whether the route is an index page.
   */
  index: boolean

  /**
   * Additional data associated with the route.
   */
  context?: Context

  /**
   * Indicates whether the route is dynamic.
   */
  isDynamic: false
}

/**
 * Represents a dynamic route, which can match and generate URLs dynamically.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface DynamicRoute<Context extends object = object>
  extends Omit<BaseRoute<Context>, 'isDynamic'> {
  /**
   * Indicates whether the route is dynamic.
   */
  isDynamic: true

  /**
   * Function to check if the given input matches the route.
   *
   * @param input The input to match against the route.
   * @returns A boolean indicating whether the input matches the route.
   */
  isMatch: (input: string) => boolean

  /**
   * Function to extract parameters from the given input if it matches the route.
   *
   * @template Params The type of parameters extracted from the input.
   * @param input The input to extract parameters from.
   * @returns The extracted parameters if the input matches the route, otherwise false.
   */
  matchParams: <Params extends object = object>(input: string) => false | Params

  /**
   * Function to generate a URL using the provided parameters.
   *
   * @template Params The type of parameters used to generate the URL.
   * @param params The parameters used to generate the URL.
   * @returns The generated URL.
   */
  generatePath: <Params extends object = object>(params: Params) => string
}
```

</details>

### `NavigationRoute<Context>`

Represents a navigation route with additional data. It inherits all properties from `Route` except for `id`.

<details>
<summary>Types:</summary>

```ts
/**
 * Represents a navigation route, which extends the base route structure and
 * can have children routes.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface NavigationRoute<Context extends object = object>
  extends Omit<Route<Context>, 'id'> {
  /**
   * Children routes of the navigation route.
   */
  children?: NavigationRoute<Context>[]
}
```

</details>

## Contributing

We 💛&nbsp; issues.

When committing, please conform to [the semantic-release commit standards](https://www.conventionalcommits.org/). Please install `commitizen` and the adapter globally, if you have not already.

```bash
npm i -g commitizen cz-conventional-changelog
```

Now you can use `git cz` or just `cz` instead of `git commit` when committing. You can also use `git-cz`, which is an alias for `cz`.

```bash
git add . && git cz
```

## License

![GitHub](https://img.shields.io/github/license/bent10/headless-route)

A project by [Stilearning](https://stilearning.com) &copy; 2024.
