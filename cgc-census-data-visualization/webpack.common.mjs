import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
  plugins: [
       new HtmlWebpackPlugin({
        template: "./index.html"
      }),
    ],
  entry: {
    app: "./scripts/main.ts"
  },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: "ts-loader"
      }
    ]
  },
  output: {
    path: path.resolve("dist"),
    clean: true,
    filename: "./scripts/main.js"
  }
};