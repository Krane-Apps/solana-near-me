// Official Solana Mobile polyfills for React Native
import { Buffer } from 'buffer';

// Set global Buffer
global.Buffer = Buffer;

// Define Crypto class with getRandomValues method using react-native-get-random-values
import 'react-native-get-random-values';

// Create a simple crypto polyfill for React Native
class Crypto {
  getRandomValues(array: any) {
    // react-native-get-random-values should provide crypto.getRandomValues
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return crypto.getRandomValues(array);
    }
    // Fallback for environments where crypto.getRandomValues is not available
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
}

// Check if crypto is already defined in the global scope
const hasInbuiltWebCrypto = typeof global.crypto !== 'undefined';

// Use existing crypto if available, otherwise create a new Crypto instance
const webCrypto = hasInbuiltWebCrypto ? global.crypto : new Crypto();

// Polyfill crypto object if it's not already defined
if (!hasInbuiltWebCrypto) {
  (global as any).crypto = webCrypto;
} 