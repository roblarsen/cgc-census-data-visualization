import { merge } from "webpack-merge";
import common from "./webpack.common.mjs";
import CopyPlugin from "copy-webpack-plugin";

export default merge(common, {
  mode: "production",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "img", to: "img" },
        { from: "css", to: "css" },
        { from: "icon.svg", to: "icon.svg" },
        { from: "favicon.ico", to: "favicon.ico" },
        { from: "robots.txt", to: "robots.txt" },
        { from: "icon.png", to: "icon.png" },
        { from: "404.html", to: "404.html" },
        { from: "site.webmanifest", to: "site.webmanifest" }
      ]
    })
  ]
});
