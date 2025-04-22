import path from "path";

export default {
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