'use strict'

var path = require('path')
var metalsmithAssets = require('metalsmith-assets')
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
    function filterFile(file, callback) {
      // Ensure it matches the extension.
      var correctExtention = path.extname(file) === opts.extname

      // Make sure it has defined files.
      var source = files[file].source || false
      var destination = files[file].destination || '.'
      callback(null, correctExtention && source && destination)
    }

    /**
     * Tell Metalsmith Assets to process the data.
     */
    function assetFile(filename, callback) {
      var data = {
        source: files[filename].source,
        destination: files[filename].destination || path.join(path.dirname(filename), '.')
      }
      delete files[filename]
      metalsmithAssets(data)(files, metalsmith, callback)
    }

    // Find all the .concat files.
    async.filter(Object.keys(files), filterFile, function (err, assets) {
      if (err) {
        done(err)
      } else {
        // Use async to process each concat object.
        async.each(assets, assetFile, done)
      }
    })
  }
}
