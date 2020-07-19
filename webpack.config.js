const path = require('path')

module.exports = {
	mode: 'development',
	entry: {app: './js/index.js'},
  output: {
    filename: '[name].pak.js',
    path: path.resolve(__dirname, ''),
  },
}
