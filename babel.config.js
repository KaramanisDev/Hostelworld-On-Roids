module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: '3',
        // latest stable versions of browsers that support browser extension manifest v3.
        targets: {
          chrome: '88',
          firefox: '78',
          safari: '14',
          edge: '88'
        }
      },
    ],
  ],
};