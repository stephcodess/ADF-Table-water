const path = require("path");

module.exports = {
  entry: "./src/electron/renderer/index.tsx", // Correct entry point
  output: {
    filename: "bundle.js", // Output bundle name
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-react", // Support React JSX
              "@babel/preset-env", // Support ES6+ syntax
              "@babel/preset-typescript", // Add this to process TypeScript
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"], // Ensure these extensions are supported
  },
  devtool: "inline-source-map",
};
