const { resolve, join } = require("path");

module.exports = {
  entry: "./src/index.ts",
  devtool: "source-map",

  devServer: {
    contentBase: resolve(__dirname, "public"),
    inline: true,
    liveReload: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "pdf-reader.js",
    library: "PDFReader",
    libraryTarget: "window",
  },
};
