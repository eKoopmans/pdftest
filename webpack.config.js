const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = env => {
  const isDev = env === 'dev';
  const mode = isDev ? 'development' : 'production';
  const minStr = isDev ? '' : '.min';
  const watch = isDev;
  const useAnalyzer = env.includes('analyze');

  const builds = {
    browser: {
      mode,
      entry: './src/client/index.js',
      filename: `pdftest.client${minStr}.js`,
      library: 'pdftest',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      resolve: {
        fallback: { url: require.resolve('url') },
      },
      bundleAnalyzer: {
        analyzerMode: useAnalyzer ? 'server' : 'disabled',
      },
    },
    node: {
      mode: 'development',
      entry: './src/index.js',
      filename: 'pdftest.cjs.js',
      libraryTarget: 'commonjs2',
      externals: ['cors', 'express', 'fs', 'isomorphic-unfetch', 'path', /pdfjs/, 'pixelmatch'],
      externalsType: 'commonjs',
    },
  };

  return Object.values(builds).map(build => ({
    mode: build.mode,
    entry: build.entry,
    watch: watch,
    watchOptions: {
      ignored: /node_modules/,
    },
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: build.filename,
      library: build.library,
      libraryTarget: build.libraryTarget,
      umdNamedDefine: build.umdNamedDefine,
    },
    node: false,
    externals: build.externals,
    externalsType: build.externalsType,
    resolve: build.resolve,
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new BundleAnalyzerPlugin(build.bundleAnalyzer || { analyzerMode: 'disabled' }),
    ],
  }));
};
