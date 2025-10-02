const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  entry: './components/embed-popup/standalone-bundle-root.tsx', // Input file
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'embed-popup.js', // Output file
  },
  devtool: 'source-map', // Equivalent to sourcemap: true
  resolve: {
    alias: { '@/*': path.resolve(__dirname, '*') },
    extensions: ['.tsx', '.ts', '.js'], // Resolve TypeScript and JS files
  },
  plugins: [
    // NOTE: the below doesn't whitelist, see https://github.com/mrsteele/dotenv-webpack/issues/41
    new Dotenv({
      systemvars: true,
      path: '.env.local',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['css-loader', 'postcss-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // Mark LiveKitEmbedFixed as an external global (optional depending on usage)
    LiveKitEmbedFixed: 'LiveKitEmbedFixed',
  },
};
