const {merge} = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	module: {
		rules: [{
			exclude: /node_modules/,
			test: /\.(js)$/,
			use: ['babel-loader', {
				loader: 'babel-loader',
				options: {presets: ['@babel/preset-modules']}
			}]
		}]
	},
})
