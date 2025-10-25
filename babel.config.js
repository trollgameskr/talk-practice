module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      // Ensure "loose" mode is consistent for private/class transforms to
      // silence warnings from Babel about mismatched "loose" options.
      [
        '@babel/plugin-transform-class-properties',
        {
          loose: true,
        },
      ],
      [
        '@babel/plugin-transform-private-methods',
        {
          loose: true,
        },
      ],
      [
        '@babel/plugin-transform-private-property-in-object',
        {
          loose: true,
        },
      ],
    ],
  };
};
