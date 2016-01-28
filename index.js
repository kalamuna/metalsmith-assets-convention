'use strict'

var metalsmithAssets = require('metalsmith-assets')
var path = require('path')
var async = require('async')

module.exports = function (opts) {
  // Default configuration.
  opts = opts || {}
  opts.extname = opts.extname || '.assets'

  // Execute the plugin.
  return function (files, metalsmith, done) {
    /**
     * Check if the given file is a .concat file. Call done() with result.
     */
    function filterFile(file, done) {
      // Ensure it matches the extension.
      var correctExtention = path.extname(file) === opts.extname

      // Make sure it has defined files.
      var source = files[file].source || false
      var destination = files[file].destination || false
      done(correctExtention && source && destination)
    }

    /**
     * Tell Metalsmith Assets to process the data.
     */
    function assetFile(file, done) {
      if (file in files) {
        // Execute assets plugin.
        var data = {
          source: files[file].source,
          destination: files[file].destination
        }
        metalsmithAssets(data)(files, metalsmith, done)

        // We do not need the .assets file anymore.
        delete files[file]
      }
    }

    // Find all the .concat files.
    async.filter(Object.keys(files), filterFile, function (assets) {
      // Use async to process each concat object.
      async.each(assets, assetFile, done)
    })
  }
}
