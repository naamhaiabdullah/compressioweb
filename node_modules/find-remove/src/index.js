const fs = require('fs')
const path = require('path')
const merge = require('fmerge')
const rimraf = require('rimraf')

let now
let testRun

function isOlder(path, ageSeconds) {
  const stats = fs.statSync(path)
  const mtime = stats.mtime.getTime()
  const expirationTime = mtime + ageSeconds * 1000

  return now > expirationTime
}

function hasLimit(options) {
  return options && 'limit' in options
}

function getLimit(options) {
  return hasLimit(options) ? options.limit : -1
}

function hasTotalRemoved(options) {
  return options && 'totalRemoved' in options
}

function getTotalRemoved(options) {
  return hasTotalRemoved(options) ? options.totalRemoved : -2
}

function isOverTheLimit(options) {
  return getTotalRemoved(options) >= getLimit(options)
}

function hasMaxLevel(options) {
  return options && 'maxLevel' in options
}

function getMaxLevel(options) {
  return hasMaxLevel(options) ? options.maxLevel : -1
}

function getAgeSeconds(options) {
  return options && options.age && options.age.seconds ? options.age.seconds : null
}

function doDeleteDirectory(currentDir, options, currentLevel) {
  let doDelete = false
  const dir = options && options.dir

  if (dir) {
    const ageSeconds = getAgeSeconds(options)
    const basename = path.basename(currentDir)

    if (Array.isArray(dir)) {
      doDelete = dir.indexOf('*') !== -1 || dir.indexOf(basename) !== -1
    } else if (basename === dir || dir === '*') {
      doDelete = true
    }

    if (doDelete && hasLimit(options)) {
      doDelete = !isOverTheLimit(options)
    }

    if (doDelete && hasMaxLevel(options) && currentLevel > 0) {
      doDelete = currentLevel <= getMaxLevel(options)
    }

    if (ageSeconds && doDelete) {
      doDelete = isOlder(currentDir, ageSeconds)
    }
  }

  return doDelete
}

function doDeleteFile(currentFile, options = {}) {
  // by default it deletes nothing
  let doDelete = false

  const extensions = options.extensions ? options.extensions : null
  const files = options.files ? options.files : null
  const prefix = options.prefix ? options.prefix : null
  const ignore = options && options.ignore ? options.ignore : null

  // return the last portion of a path, the filename aka basename
  const basename = path.basename(currentFile)

  if (files) {
    if (Array.isArray(files)) {
      doDelete = files.indexOf('*.*') !== -1 || files.indexOf(basename) !== -1
    } else {
      if (files === '*.*') {
        doDelete = true
      } else {
        doDelete = basename === files
      }
    }
  }

  if (!doDelete && extensions) {
    const currentExt = path.extname(currentFile)

    if (Array.isArray(extensions)) {
      doDelete = extensions.indexOf(currentExt) !== -1
    } else {
      doDelete = currentExt === extensions
    }
  }

  if (!doDelete && prefix) {
    doDelete = basename.indexOf(prefix) === 0
  }

  if (doDelete && hasLimit(options)) {
    doDelete = !isOverTheLimit(options)
  }

  if (doDelete && ignore) {
    if (Array.isArray(ignore)) {
      doDelete = !(ignore.indexOf(basename) !== -1)
    } else {
      doDelete = !(basename === ignore)
    }
  }

  if (doDelete) {
    const ageSeconds = getAgeSeconds(options)

    if (ageSeconds) {
      doDelete = isOlder(currentFile, ageSeconds)
    }
  }

  return doDelete
}

function isTestRun(options) {
  return options && 'test' in options ? options.test : false
}

/**
 * findRemoveSync(currentDir, options) takes any start directory and searches files from there for removal.
 * the selection of files for removal depends on the given options. when no options are given, or only the maxLevel
 * parameter is given, then everything is removed as if there were no filters.
 *
 * beware: everything happens synchronously.
 *
 *
 * @param {String} currentDir any directory to operate within. it will seek files and/or directories recursively from there.
 * beware that it deletes the given currentDir when no options or only the maxLevel parameter are given.
 * @param options json object with optional properties like extensions, files, ignore, maxLevel and age.seconds.
 * @return {Object} json object of files and/or directories that were found and successfully removed.
 * @api public
 */
const findRemoveSync = (module.exports = function (currentDir, options, currentLevel) {
  let removed = {}

  if (!isOverTheLimit(options) && fs.existsSync(currentDir)) {
    const maxLevel = getMaxLevel(options)
    let deleteDirectory = false

    if (hasLimit(options)) {
      options.totalRemoved = hasTotalRemoved(options) ? getTotalRemoved(options) : 0
    }

    if (currentLevel === undefined) {
      currentLevel = 0
    } else {
      currentLevel++
    }

    if (currentLevel < 1) {
      now = new Date().getTime()
      testRun = isTestRun(options)
    } else {
      // check directories before deleting files inside.
      // this to maintain the original creation time,
      // because linux modifies creation date of folders when files within have been deleted.
      deleteDirectory = doDeleteDirectory(currentDir, options, currentLevel)
    }

    if (maxLevel === -1 || currentLevel < maxLevel) {
      const filesInDir = fs.readdirSync(currentDir)

      filesInDir.forEach(function (file) {
        const currentFile = path.join(currentDir, file)
        let skip = false
        let stat

        try {
          stat = fs.statSync(currentFile)
        } catch (exc) {
          // ignore
          skip = true
        }

        if (skip) {
          // ignore, do nothing
        } else if (stat.isDirectory()) {
          // the recursive call
          const result = findRemoveSync(currentFile, options, currentLevel)

          // merge results
          removed = merge(removed, result)
          if (hasTotalRemoved(options)) {
            options.totalRemoved += Object.keys(result).length
          }
        } else {
          if (doDeleteFile(currentFile, options)) {
            let unlinked

            if (!testRun) {
              try {
                fs.unlinkSync(currentFile)
                unlinked = true
              } catch (exc) {
                // ignore
              }
            } else {
              unlinked = true
            }

            if (unlinked) {
              removed[currentFile] = true
              if (hasTotalRemoved(options)) {
                options.totalRemoved++
              }
            }
          }
        }
      })
    }

    if (deleteDirectory) {
      if (!testRun) {
        rimraf.sync(currentDir)
      }

      if (!hasTotalRemoved(options)) {
        // for limit of files - we do not want to count the directories
        removed[currentDir] = true
      }
    }
  }

  return removed
})
