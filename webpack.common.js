const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
	entry: {app: './app/index.js'},
	plugins: [new CleanWebpackPlugin()],
	module: {
		rules: [{
			exclude: /node_modules/,
			test: /\.(js)$/,
			use: ['babel-loader']
		}]
	},
	resolve: {
		extensions: ['*', '.js']
	},
  output: {
    filename: '[name].pak.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
