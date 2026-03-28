/**
 * Replaces axios's Node `http` adapter for the browser bundle. The real adapter
 * imports Node core modules (`http`, `https`, …) which Webpack 5 does not polyfill.
 * Browser requests use `xhr` / `fetch` from axios defaults instead.
 */
export default function httpAdapter() {
  return Promise.reject(
    new Error('Axios Node HTTP adapter is not available in the browser build.')
  );
}
