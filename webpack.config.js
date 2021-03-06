// module.exports = {
//     entry: "./source/javascripts/simulate.js",
//     output: {
//         path: __dirname,
//         filename: "bundle.js"
//     },
//     module: {
//         loaders: [
//             // { test: /\.css$/, loader: "style!css" }
//         ]
//     }
// };

var webpack = require('webpack');

module.exports = {
  entry: {
    simulate: './source/javascripts/all.js'
  },

  resolve: {
    root: __dirname + '/source/javascripts',
  },

  output: {
    path: __dirname + '/.tmp/dist',
    filename: 'javascripts/[name].js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }]
  }
};
