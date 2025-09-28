# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm install`

Install all project dependencies.

- This project uses SCSS for styling in several components. The Sass compiler package `sass` is required and is already listed in package.json.

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in non-interactive watch mode suitable for CI.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## SCSS/Sass Setup

This project includes `.scss` files (for example: `src/components/ScheduleICU.scss`, `src/styles/_variables.scss`, etc.).\
Create React App compiles SCSS using the `sass` package.

- Dependency (already included in package.json):
  - "sass": "^1.77.8"

If you encounter issues, install it explicitly:
- Using npm:
  - npm install --save-dev sass
- Using yarn:
  - yarn add -D sass
- Using pnpm:
  - pnpm add -D sass

You can then import SCSS in your components, e.g.:
```ts
import "./components/ScheduleICU.scss";
```

Note: Some components in this project import the compiled CSS counterpart (e.g., `Header.css`) to keep runtime lightweight. You can switch those to SCSS imports if you prefer, as long as `sass` is installed.

## Troubleshooting SCSS Compilation

- Error: Module not found: Error: Can't resolve 'sass'
  - Run: `npm install --save-dev sass` (or the yarn/pnpm equivalents listed above)
  - Ensure your Node.js version is supported by the installed Sass version.

- Error: SassError: Can't find stylesheet to import
  - Verify relative import paths in SCSS files (e.g., `@use "../styles/variables" as *;`)
  - Ensure partials start with an underscore (e.g., `_variables.scss`) and are in the referenced folder.

- Error: PostCSS/Sass conflicts when both CSS and SCSS exist
  - Prefer one import per component: either `.scss` or `.css`. Remove duplicate imports if both exist.

- CI builds failing due to missing devDependency
  - If your environment only installs "dependencies", you can move `sass` to "dependencies" instead of "devDependencies". By default, CRA supports having it in devDependencies.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/styles/_variables.scss` or in component-level styles.

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. Common component styles can be found under `src/styles` and component folders.

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting
This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size
This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App
This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration
This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment
This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify
This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
