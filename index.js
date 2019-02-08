'use strict'

const path = require('path')
const metalsmithAssets = require('metalsmith-assets')
const async = require('async')

module.exports = function (opts) {
  // Default configuration.
  opts = opts || {}
  opts.extname = opts.extname || '.assets'

  // Execute the plugin.
  return function (files, metalsmith, done) {
    /**
     * Check if the given file is a .concat file. Call done() with result.
     *
     * @param {string} file The file to filter on.
     * @param {function} callback A asyncronous callback that's made once the processing is complete.
     */
    function filterFile(file, callback) {
      // Ensure it matches the extension.
      const correctExtention = path.extname(file) === opts.extname

      // Make sure it has defined files.
      const source = files[file].source || false
      const destination = files[file].destination || '.'
      callback(null, correctExtention && source && destination)
    }

    /**
     * Tell Metalsmith Assets to process the data.
     *
     * @param {string} filename The file to filter on.
     * @param {function} callback A asyncronous callback that's made once the processing is complete.
     */
    function assetFile(filename, callback) {
      const data = {
        source: files[filename].source,
        destination: files[filename].destination || path.join(path.dirname(filename), '.')
      }
      delete files[filename]
      metalsmithAssets(data)(files, metalsmith, callback)
    }

    // Find all the .concat files.
    async.filter(Object.keys(files), filterFile, (err, assets) => {
      if (err) {
        done(err)
      } else {
        // Use async to process each concat object.
        async.each(assets, assetFile, done)
      }
    })
  }
}
