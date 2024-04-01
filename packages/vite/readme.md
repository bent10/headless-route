# @headless-route/vite

[Vite](https://vitejs.dev/) plugin for integrating [`headless-route`](https://github.com/bent10/headless-route/tree/main/packages/core). It offers functions to create routes and navigation routes from the directory structure, loading data, building routes, and serving routes during development.

## Install

```bash
npm create vite@latest
npm i -D @headless-route/vite
```

## Usage

Configure this plugin in your Vite configuration file (`vite.config.js`):

```js
import headlessRoute from '@headless-route/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    headlessRoute({
      dir: 'pages',
      extensions: ['.html', '.md'],
      dataOptions: { dir: 'data' },
      handler: {
        async html(content) {
          // process html content here...
          return content
        },
        // we can define multiple handler
        md: [
          async function markdownHandler(content) {
            // process html content here...
            return content
          },
          // The string `'html'` indicates that the html handler will execute
          // after the `markdownHandler` has run!
          'html'
        ]
      }
    })
  ]
})
```

The plugin provides several options for configuring your headless routes:

- `dir`: The root directory for your routes (default: 'pages').
- `dataOptions`: Options for configuring data.
- `handler`: A route handler object where keys are strings starting with a dot (`.`) and values are route handler functions.
- `fallbackRoute`: The fallback route to redirect to if no matching route is found (default: `'/404'`).
- `...routesOptions`: Please refer to [`headless-route`](https://github.com/bent10/headless-route/tree/main/packages/core#api) documentation.

## Related

- [`headless-route`](https://github.com/bent10/headless-route/tree/main/packages/core)
- [`@headless-route/vite-preset-handler`](https://github.com/bent10/headless-route/tree/main/packages/vite-preset-handler)

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
