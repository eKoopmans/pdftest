const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = env => {
  const isDev = env === 'dev';
  const mode = isDev ? 'development' : 'production';
  const minStr = isDev ? '' : '.min';
  const watch = isDev;

  return {
    mode: mode,
    entry: './src/index.js',
    watch: watch,
    watchOptions: {
      ignored: /node_modules/,
    },
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `main${minStr}.js`,
      library: 'pdftest',
      libraryExport: 'default',
      // libraryTarget: 'umd',
      // umdNamedDefine: true,
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'disabled',
        generateStatsFile: true,
        statsFilename: `stats${minStr}.json`,
        statsOptions: { source: false },
      }),
    ],
  };
};
