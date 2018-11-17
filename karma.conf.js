module.exports = function(config) {
  config.set({
    frameworks: [ 'jasmine' ],
    files: [ '**/__tests__/*.test.js' ],
    preprocessors: {
      '**/__tests__/*.test.js': [ 'webpack' ]
    },
    reporters: [ 'progress' ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [ 'ChromeHeadless' ],
    singleRun: false,
    concurrency: Infinity,
  })
}
