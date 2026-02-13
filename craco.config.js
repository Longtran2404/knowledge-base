const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        vm: require.resolve('vm-browserify'),
      };

      // Optimized chunk splitting for faster development
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: -5,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };

      // Add plugins (ESLint chỉ chạy lúc build để dev start nhanh hơn)
      const isDev = webpackConfig.mode === 'development';
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
        ...(isDev ? [] : [
          new ESLintPlugin({
            extensions: ['js', 'jsx', 'ts', 'tsx'],
            cache: true,
            cacheLocation: 'node_modules/.cache/eslint-webpack-plugin',
            failOnError: false,
            failOnWarning: false,
          }),
        ]),
      ];

      // Development: tắt bớt tối ưu để khởi động nhanh hơn
      if (webpackConfig.mode === 'development') {
        webpackConfig.optimization.removeAvailableModules = false;
        webpackConfig.optimization.removeEmptyChunks = false;
        webpackConfig.optimization.splitChunks = false;
        // eval nhanh hơn cheap-module-source-map cho lần build đầu
        webpackConfig.devtool = 'eval';
      }

      return webpackConfig;
    },
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    },
  },
};