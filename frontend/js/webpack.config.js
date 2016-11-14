var webpack = require("webpack");

module.exports = {
  entry: "./app/main",
  output: {
    path: __dirname + "/dist",
    publicPath: 'dist/',
    filename: "bundle.js"
  },
  resolve: {
    extensions: ['', '.js', '.ts']
  },
  module: {
    loaders: [{
      test: /\.tsx?$/, loaders: ['ts-loader'], exclude: /node_modules/
    }]
  },
  plugins: [
     //new webpack.optimize.UglifyJsPlugin({minimize: true})
 ]
};
