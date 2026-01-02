// Polyfills must be imported before anything else
import 'expo-crypto';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
