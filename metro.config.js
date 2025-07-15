const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add basic polyfill resolver for buffer only
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer'),
};

module.exports = config; 