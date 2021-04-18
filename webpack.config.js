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
      target: 'browserslist',
      output: {
        filename: `pdftest.client${minStr}.js`,
        library: 'pdftest',
        libraryTarget: 'umd',
        umdNamedDefine: true,
      },
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
      target: 'node',
      output: {
        filename: 'pdftest.cjs.js',
        libraryTarget: 'commonjs2',
      },
      externals: ['cors', 'express', 'fs', 'cross-fetch', 'path', /pdfjs/, 'pixelmatch'],
      externalsType: 'commonjs',
      babelOptions: {
        presets: ['@babel/preset-env'],
        targets: { node: "current" },
      },
    },
    'chai-pdftest': {
      mode,
      entry: './src/frameworks/chai-pdftest.js',
      target: 'browserslist',
      output: {
        filename: `chai-pdftest${minStr}.js`,
      },
    },
  };

  return Object.values(builds).map(build => ({
    mode: build.mode,
    entry: build.entry,
    target: build.target,
    watch: watch,
    watchOptions: {
      ignored: /node_modules/,
    },
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      ...build.output,
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
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: new RegExp(path.join('node_modules', '(?!pixelmatch)').replace('\\', '\\\\')),
          use: {
            loader: "babel-loader",
            options: build.babelOptions,
          },
        },
      ],
    },
  }));
};
