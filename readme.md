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

Say we have the following directory structure:

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

Create routes based on a directory structure:

```js
import { createRoutes, createNavigation } from 'headless-route'
// Or for CommonJS:
// const { createRoutes, createNavigation } = require('headless-route')

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
      const apifile = dirname(route.id) + '/api.js'

      route.context = await import(apifile)
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
    id: 'pages/blogs/:slug.md',
    stem: 'blogs/:slug',
    url: '/blogs/:slug.html',
    index: false,
    isDynamic: true,
    params: { slug: '/blogs/:slug' }
  },
  {
    id: 'pages/contact.md',
    stem: 'contact',
    url: '/contact.html',
    index: false,
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

Create navigation routes from routes:

```js
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
        params: {
          slug: '/blogs/:slug'
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

## Best practices

When structuring your project, adhere to the following best practices:

- Files or directories starting with an underscore character (`_`) should be ignored:

  ```js
  const routes = await createRoutes({
    filter(file) {
      // ignore files starting with '_'
      return !file.name.startsWith('_')
    }
  })
  ```

- File or directory names starting with a dollar character (`$`) or colon (`:`) will be treated as a “dynamic segment”.

  Dynamic segments should be formatted as follows:

  - 🚫 `/users-:id`
  - ✅ `/users/:id` or `/users/$id`
  - 🚫 `/posts/:category--:id`
  - ✅ `/posts/:category/:id`

- Follow a consistent pattern in CRUD operations. Instead of naming files like `foo/$id.edit.tsx`, use `foo/$id/edit.tsx`:

  🚫 Bad:

  - `pages/users/$id.create.tsx`
  - `pages/users/$id.edit.tsx`
  - `pages/users/$id.delete.tsx`
  - `pages/users/$id.view.tsx`

  ✅ Good:

  - `pages/users/$id/create.tsx`
  - `pages/users/$id/edit.tsx`
  - `pages/users/$id/delete.tsx`
  - `pages/users/$id/view.tsx`
  - `pages/users/api.ts`
  - `pages/users/index.tsx`

> [!CAUTION]
> Note that the colon character (`:`) is invalid for file names on Windows.

## API

### `createRoutes(options: Options): Promise<Route[]>`

Creates routes based on the specified options.

- `options`: An object containing options for creating routes.

  - `dir`: The directory to scan for routes. Defaults to the current working directory (`process.cwd()`).
  - `extensions`: The file extensions to include when scanning for routes. Defaults (`['.html', '.md', '.js']`).
  - `urlSuffix`: The suffix to append to route URLs. Defaults to an empty string.
  - `cache`: Indicates whether to cache routes. Defaults to `false`.
  - `filter`: A filter function for filtering Dirent objects.
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

### `createNavigation(routes: Route[]): Promise<NavigationRoute[]>`

Creates navigation routes based on the specified routes. A navigation route object has the same structure as a route object, excluding the `id` property. It may also contain `children` property, representing the children routes of the navigation route.

- `routes`: An array of routes.

### `createNavigationSync(routes: Route[]): NavigationRoute[]`

Creates navigation routes based on the specified routes synchronously.

## Types

### `Route<Context>`

Represents a single route in the MPA.

- `id`: The unique identifier for the route.
- `stem`: The stem of the route URL.
- `url`: The URL of the route.
- `index`: Indicates whether the route is an index page.
- `isDynamic`: Indicates whether the route is dynamic.
- `context`: Additional data associated with the route.
- `params?`: Optional parameters for the route.

### `NavigationRoute<Context>`

Represents a navigation route with additional data.

- Inherits all properties from `Route`, except for `id`.
- `children?`: Representing the children routes of the navigation route.

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
