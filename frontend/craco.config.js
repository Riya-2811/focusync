const path = require('path');

/**
 * Axios pulls the Node HTTP adapter into the bundle; Webpack 5 cannot resolve `http`/`https`.
 * Point only that file at a browser stub. Do not alias the `axios` package itself.
 */
module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve = config.resolve || {};
      const axiosHttpAdapter = path.resolve(
        __dirname,
        'node_modules/axios/lib/adapters/http.js'
      );
      const axiosHttpStub = path.resolve(
        __dirname,
        'src/stubs/axios-http-adapter.js'
      );
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        [axiosHttpAdapter]: axiosHttpStub,
      };
      return config;
    },
  },
};
