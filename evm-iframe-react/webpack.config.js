const path = require("path")

module.exports = {
	entry: path.resolve(__dirname, "./index.js"),
	mode: "development",
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ["babel-loader"],
			},
			{
				test: /\.s?css$/,
				use: [
					"style-loader",
					"css-loader",
					"resolve-url-loader",
					{ loader: "sass-loader", options: { sourceMap: true } },
				],
			},
		],
	},
	resolve: {
		extensions: ["*", ".js", ".jsx"],
		fallback: {
			crypto: false,
		},
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "bundle.js",
	},
	devServer: {
		static: path.resolve(__dirname, "./dist"),
	},
}
