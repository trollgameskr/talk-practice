const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: process.env.GITHUB_PAGES ? '/talk-practice/' : '/',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-tts': path.resolve(
        __dirname,
        'src/services/web/TTSShim.web.js',
      ),
      '@react-native-community/voice': path.resolve(
        __dirname,
        'src/services/web/VoiceShim.web.js',
      ),
      'react-native-audio-recorder-player': path.resolve(
        __dirname,
        'src/services/web/AudioRecorderShim.web.js',
      ),
      'react-native-sound': path.resolve(
        __dirname,
        'src/services/web/SoundShim.web.js',
      ),
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
    ],
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      }),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html'], // index.html is handled by HtmlWebpackPlugin
          },
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
