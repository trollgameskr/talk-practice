/**
 * GeminiTalk - Web Entry Point
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './package.json';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Run the app in the browser
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
