const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve packages only from the mobile-app/node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules')
];

// Prevent Metro from looking up the directory tree for modules (isolating the project)
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
