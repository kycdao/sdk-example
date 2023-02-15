const webpack = require("webpack")

module.exports = function override(config) {
	config.resolve.fallback = config.resolve.fallback
		? {
				...config.resolve.fallback,
				crypto: false,
		  }
		: { crypto:false }

	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			Buffer: ["buffer", "Buffer"],
			ethereum: ["ethereum", "ethereum"],
		}),
	])

	return config
}
