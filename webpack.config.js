const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// GitHub Pages base path configuration
const BASE_PATH = process.env.GITHUB_PAGES ? '/talk-practice' : '';

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: BASE_PATH ? BASE_PATH + '/' : '/',
    clean: true, // Clean the output directory before emit
  },
  optimization: {
    // Disable code splitting to ensure single bundle output
    splitChunks: false,
    runtimeChunk: false,
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
      templateParameters: {
        // BASE_PATH를 빈 문자열이 아닌 실제 경로로 설정
        // 예: '/talk-practice' 또는 '' (로컬 개발)
        BASE_PATH: BASE_PATH || '',
      },
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
      __BASE_PATH__: JSON.stringify(BASE_PATH),
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
        FIREBASE_MESSAGING_SENDER_ID:
          process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
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
            ignore: [
              '**/index.html',
              '**/service-worker.js',
              '**/404.html',
              '**/manifest.json',
            ], // These files need template processing
          },
        },
        {
          from: 'public/404.html',
          to: '404.html',
          transform(content) {
            // Replace __BASE_PATH__ placeholder with actual base path
            return content
              .toString()
              .replace(/__BASE_PATH__/g, BASE_PATH);
          },
        },
        {
          from: 'public/manifest.json',
          to: 'manifest.json',
          transform(content) {
            // Update manifest.json with correct base path
            const manifest = JSON.parse(content.toString());
            if (BASE_PATH) {
              manifest.start_url = BASE_PATH + '/';
              manifest.scope = BASE_PATH + '/';
            }
            return JSON.stringify(manifest, null, 2);
          },
        },
        {
          from: 'public/service-worker.js',
          to: 'service-worker.js',
          transform(content) {
            // Replace __BUILD_TIMESTAMP__ in service worker with actual timestamp
            return content
              .toString()
              .replace(/__BUILD_TIMESTAMP__/g, new Date().toISOString());
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
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:4000',
        secure: false,
        changeOrigin: true,
      },
    ],
    hot: true,
    historyApiFallback: true,
  },
};
