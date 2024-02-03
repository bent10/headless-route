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

const routes = createRoutes({
  dir: 'pages',
  extensions: ['.html', '.md'],
  urlSuffix: '.html',
  filter(file) {
    // ignore files starting with '_'
    return !file.name.startsWith('_')
  }
})

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
    params: { ':slug': '/blogs/:slug' }
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
const navigationRoutes = createNavigation(routes)

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
          ':slug': '/blogs/:slug'
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

## API

### `createRoutes(options: Options): Route[]`

Creates routes based on the specified options.

- `options`: An object containing options for creating routes.

  - `dir`: The directory to scan for routes. Defaults to the current working directory (`process.cwd()`).
  - `extensions`: The file extensions to include when scanning for routes. Defaults (`['.html', '.md', '.js']`).
  - `urlSuffix`: The suffix to append to route URLs. Defaults to an empty string.
  - `cache`: Indicates whether to cache routes. Defaults to `false`.
  - `filter`: A filter function for filtering Dirent objects.
  - `handler`: A handler function called for each route.

    ```js
    createRoutes({
      dir: 'pages',
      handler(route) {
        if (route.id.endsWith('.js')) {
          // attach a lazy route for JavaScript files
          route.lazy = import(route.id)
        }
      }
    })
    ```

### `createNavigation(routes: Route[]): NavigationRoute[]`

Creates navigation routes based on the specified routes. A navigation route object has the same structure as a route object, excluding the `id` property. It may also contain `children` property, representing the children routes of the navigation route.

- `routes`: An array of routes.

## Types

### `Route<Data>`

Represents a single route in the MPA.

- `id`: The unique identifier for the route.
- `stem`: The stem of the route URL.
- `url`: The URL of the route.
- `index`: Indicates whether the route is an index page.
- `isDynamic`: Indicates whether the route is dynamic.
- `params`: Optional parameters for the route.
- `data`: Additional data associated with the route.

### `NavigationRoute<Data>`

Represents a navigation route with additional data.

- Inherits all properties from `Route`, except for `id`.

### `Options`

Represents options for creating routes.

- `dir`: The directory to scan for routes.
- `urlSuffix`: The suffix to append to route URLs.
- `cache`: Indicates whether to cache routes.
- `filter`: A filter function for filtering Dirent objects.
- `handler`: A handler function called for each route.

### `Params`

Represents a map of parameters with string keys and string values.

### `UnknownData`

Represents additional data associated with routes.

### `FilterFn`

Represents a filter function for filtering Dirent objects.

### `HandlerFn`

Represents a handler function called for each route.

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
