const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  crypto: 'react-native-crypto',
  stream: 'stream-browserify',
  buffer: '@craftzdog/react-native-buffer',
};

module.exports = config; 