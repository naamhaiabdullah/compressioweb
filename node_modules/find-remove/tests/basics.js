/* eslint-disable camelcase */

const testCase = require('nodeunit').testCase
const randomstring = require('randomstring')
const mkdirp = require('mkdirp')
const path = require('path')
const {
  existsSync,
  promises: { writeFile }
} = require('fs')
const rimraf = require('rimraf')
const os = require('os')

const findRemoveSync = require('../src/index.js')

const rootDirectory = path.join(os.tmpdir(), 'find-remove')

function generateRandomFilename(ext) {
  let filename = randomstring.generate(24)

  if (ext) {
    filename += '.' + ext
  }

  return filename
}

/*
 pre defined directories:
    + rootDirectory

        * randomFile1 (*.bak)
        * randomFile2 (*.log)
        * randomFile3 (*.log)
        * randomFile4 (*.csv)

        + CVS (directory3)
        + directory1
            + CVS (directory1_3)
            + directory1_1
            + directory1_2
                + directory1_2_1
                    * randomFile1_2_1_1 (*.log)
                    * randomFile1_2_1_2 (*.bak)
                    * randomFile1_2_1_3 (*.bak)
                    * fixFile1_2_1_4 (something.jpg)
                    * fixFile1_2_1_5 (something.png)
                + directory1_2_2
        + directory2
            * randomFile2_1 (*.bak)
            * randomFile2_2 (*.csv)
 */

const directory1 = path.join(rootDirectory, 'directory1')
const directory2 = path.join(rootDirectory, 'directory2')
const directory3 = path.join(rootDirectory, 'CVS')

const directory1_1 = path.join(directory1, 'directory1_1')
const directory1_2 = path.join(directory1, 'directory1_2')
const directory1_3 = path.join(directory1, 'CVS')

const directory1_2_1 = path.join(directory1_2, 'directory1_2_1')
const directory1_2_2 = path.join(directory1_2, 'directory1_2_2')

// mix of pre defined and random file names
const randomFilename1 = generateRandomFilename('bak')
const randomFile1 = path.join(rootDirectory, randomFilename1)
const randomFilename2 = generateRandomFilename('log')
const randomFile2 = path.join(rootDirectory, randomFilename2)
const randomFile3 = path.join(rootDirectory, generateRandomFilename('log'))
const randomFile4 = path.join(rootDirectory, generateRandomFilename('csv'))

const randomFile2_1 = path.join(directory2, generateRandomFilename('bak'))
const randomFile2_2 = path.join(directory2, generateRandomFilename('csv'))

const randomFilename1_2_1_1 = generateRandomFilename('log')
const randomFile1_2_1_1 = path.join(directory1_2_1, randomFilename1_2_1_1)
const randomFile1_2_1_2 = path.join(directory1_2_1, generateRandomFilename('bak'))
const randomFilename1_2_1_3 = generateRandomFilename('bak')
const randomFile1_2_1_3 = path.join(directory1_2_1, randomFilename1_2_1_3)

const fixFilename1_2_1_4 = 'something.jpg'
const fixFile1_2_1_4 = path.join(directory1_2_1, fixFilename1_2_1_4)
const fixFilename1_2_1_5 = 'something.png'
const fixFile1_2_1_5 = path.join(directory1_2_1, fixFilename1_2_1_5)

async function createFakeDirectoryTree(cb) {
  try {
    await mkdirp(directory1)
    await mkdirp(directory2)
    await mkdirp(directory3)
    await mkdirp(directory1_1)
    await mkdirp(directory1_2)
    await mkdirp(directory1_3)
    await mkdirp(directory1_2_1)
    await mkdirp(directory1_2_2)

    await writeFile(randomFile1, '')
    await writeFile(randomFile2, '')
    await writeFile(randomFile3, '')
    await writeFile(randomFile4, '')
    await writeFile(randomFile2_1, '')
    await writeFile(randomFile2_2, '')
    await writeFile(randomFile1_2_1_1, '')
    await writeFile(randomFile1_2_1_2, '')
    await writeFile(randomFile1_2_1_3, '')
    await writeFile(fixFile1_2_1_4, '')
    await writeFile(fixFile1_2_1_5, '')

    cb()
  } catch (exc) {
    if (exc) {
      console.error(exc)
    }
  }
}

function destroyFakeDirectoryTree(cb) {
  rimraf(rootDirectory, cb)
}

module.exports = testCase({
  'TC 1: tests without real files': testCase({
    'loading findRemoveSync function (require)': function (t) {
      t.ok(findRemoveSync, 'findRemoveSync is loaded.')
      t.done()
    },

    'removing non-existing directory': function (t) {
      const dir = generateRandomFilename()
      const result = findRemoveSync(dir)

      t.strictEqual(Object.keys(result).length, 0, 'returned empty')

      t.done()
    }
  }),

  'TC 2: tests with real files': testCase({
    setUp: function (cb) {
      createFakeDirectoryTree(cb)
    },
    tearDown: function (cb) {
      destroyFakeDirectoryTree(cb)
    },

    'findRemoveSync(nonexisting)': function (t) {
      const result = findRemoveSync('/tmp/blahblah/hehehe/yo/what/')

      t.strictEqual(Object.keys(result).length, 0, 'did nothing.')

      t.done()
    },

    'findRemoveSync(no params)': function (t) {
      const result = findRemoveSync(rootDirectory)

      t.strictEqual(Object.keys(result).length, 0, 'did nothing.')

      const exists = existsSync(rootDirectory)
      t.equal(exists, true, 'did not remove root directory')

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, true, 'findRemoveSync(no params) did not remove directory1_1')

      t.done()
    },

    'findRemoveSync(all files)': function (t) {
      findRemoveSync(rootDirectory, { files: '*.*' })

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, true, 'did not remove directory1_1')

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      t.equal(exists1_2_1_2, false, 'removed randomFile1_2_1_2 fine')

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(exists1_2_1_3, false, 'removed randomFile1_2_1_3 fine')

      t.done()
    },

    'findRemoveSync(all directories)': function (t) {
      const result = findRemoveSync(rootDirectory, { dir: '*' })

      t.strictEqual(Object.keys(result).length, 8, 'all 8 directories deleted')

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, false, 'removed directory1_1')

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      t.equal(exists1_2_1_2, false, 'removed randomFile1_2_1_2')

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(exists1_2_1_3, false, 'removed randomFile1_2_1_3')

      t.done()
    },

    'findRemoveSync(everything)': function (t) {
      const result = findRemoveSync(rootDirectory, { dir: '*', files: '*.*' })

      t.strictEqual(Object.keys(result).length, 19, 'all 19 directories + files deleted')

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, false, 'removed directory1_1')

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      t.equal(exists1_2_1_2, false, 'did not remove randomFile1_2_1_2 fine')

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(exists1_2_1_3, false, 'dit not remove randomFile1_2_1_3 fine')

      t.done()
    },

    'findRemoveSync(files no hit)': function (t) {
      findRemoveSync(rootDirectory, { files: 'no.hit.me' })

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, true, 'did not remove directory1_1')

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(exists1_2_1_3, true, 'did not remove randomFile1_2_1_3')

      t.done()
    },

    'findRemoveSync(directory1_2_1)': function (t) {
      findRemoveSync(rootDirectory, { dir: 'directory1_2_1' })

      const exists1_2_1 = existsSync(directory1_2_1)
      t.equal(exists1_2_1, false, 'did remove directory1_2_1')

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, true, 'did not remove directory1_1')

      t.done()
    },

    'findRemoveSync(one directory and all files)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        dir: 'directory1_2_1',
        files: '*.*'
      })

      const exists1_2_1 = existsSync(directory1_2_1)
      t.equal(exists1_2_1, false, 'did remove directory1_2_1')

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, true, 'did not remove directory1_1')

      t.ok(result[randomFile1_2_1_1], 'randomFile1_2_1_1 is in result')
      t.ok(result[randomFile1_2_1_2], 'randomFile1_2_1_2 is in result')
      t.ok(result[randomFile1_2_1_3], 'randomFile1_2_1_3 is in result')
      t.ok(result[directory1_2_1], 'directory1_2_1 is in result')

      t.done()
    },

    'findRemoveSync(another directory and all files)': function (t) {
      const result = findRemoveSync(rootDirectory, { dir: 'directory2', files: '*.*' })

      const exists2 = existsSync(directory2)
      t.equal(exists2, false, 'directory2 not removed')

      const exists1_2 = existsSync(directory1_2)
      t.equal(exists1_2, true, 'directory1_2 not removed')

      t.ok(result[randomFile2_1], 'randomFile2_1 is in result')

      t.done()
    },

    'findRemoveSync(all bak files from root)': function (t) {
      findRemoveSync(rootDirectory, { extensions: '.bak' })

      const exists1 = existsSync(randomFile1)
      const exists2_1 = existsSync(randomFile2_1)
      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)

      t.equal(
        exists1,
        false,
        'findRemoveSync(all bak files from root) removed randomFile1 fine'
      )
      t.equal(
        exists2_1,
        false,
        'findRemoveSync(all bak files from root) removed exists2_1 fine'
      )
      t.equal(
        exists1_2_1_2,
        false,
        'findRemoveSync(all bak files from root) removed exists1_2_1_2 fine'
      )
      t.equal(
        exists1_2_1_3,
        false,
        'findRemoveSync(all bak files from root) removed exists1_2_1_3 fine'
      )

      const exists3 = existsSync(randomFile3)
      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      const exists0 = existsSync(rootDirectory)
      const exists1_2_1 = existsSync(directory1_2_1)

      t.equal(
        exists3,
        true,
        'findRemoveSync(all bak files from root) did not remove log file exists3'
      )
      t.equal(
        exists1_2_1_1,
        true,
        'findRemoveSync(all bak files from root) did not remove log file exists1_2_1_1'
      )
      t.equal(
        exists0,
        true,
        'findRemoveSync(all bak files from root) did not remove root directory'
      )
      t.equal(
        exists1_2_1,
        true,
        'findRemoveSync(all bak files from root) did not remove directory directory1_2_1'
      )

      t.done()
    },

    'findRemoveSync(all log files from directory1_2_1)': function (t) {
      findRemoveSync(directory1_2_1, { extensions: '.log' })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(all log files from directory1_2_1) removed randomFile1_2_1_1 fine'
      )

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      t.equal(
        exists1_2_1_2,
        true,
        'findRemoveSync(all log files from directory1_2_1) did not remove file randomFile1_2_1_2'
      )

      const exists1_2_1 = existsSync(directory1_2_1)
      t.equal(
        exists1_2_1,
        true,
        'findRemoveSync(all log files from directory1_2_1) did not remove directory directory1_2_1'
      )

      t.done()
    },

    'findRemoveSync(all bak or log files from root)': function (t) {
      findRemoveSync(rootDirectory, { extensions: ['.bak', '.log'] })

      const exists1 = existsSync(randomFile1)
      const exists2_1 = existsSync(randomFile2_1)
      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)

      const exists2 = existsSync(randomFile2)
      const exists3 = existsSync(randomFile3)
      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)

      t.equal(
        exists1,
        false,
        'findRemoveSync(all bak and log files from root) removed randomFile1 fine'
      )
      t.equal(
        exists2_1,
        false,
        'findRemoveSync(all bak and log files from root) removed exists2_1 fine'
      )
      t.equal(
        exists1_2_1_2,
        false,
        'findRemoveSync(all bak and log files from root) removed exists1_2_1_2 fine'
      )
      t.equal(
        exists1_2_1_3,
        false,
        'findRemoveSync(all bak and log files from root) removed exists1_2_1_3 fine'
      )

      t.equal(
        exists2,
        false,
        'findRemoveSync(all bak and log files from root) removed exists2 fine'
      )
      t.equal(
        exists3,
        false,
        'findRemoveSync(all bak and log files from root) removed exists3 fine'
      )
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(all bak and log files from root) removed exists1_2_1_1 fine'
      )

      const exists1_1 = existsSync(directory1_1)
      t.equal(
        exists1_1,
        true,
        'findRemoveSync(all bak and log files from root) did not remove directory1_1'
      )

      t.done()
    },

    'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2)': function (t) {
      findRemoveSync(directory1_2, { files: randomFilename1_2_1_1 })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) removed randomFile1_2_1_1 fine'
      )

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      t.equal(
        exists1_2_1_2,
        true,
        'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) did not remove randomFile1_2_1_2'
      )

      const exists1_2 = existsSync(directory1_2)
      t.equal(
        exists1_2,
        true,
        'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) did not remove directory1_2'
      )

      t.done()
    },

    'findRemoveSync(two files from root)': function (t) {
      findRemoveSync(rootDirectory, { files: [randomFilename2, randomFilename1_2_1_3] })

      const exists2 = existsSync(randomFile2)
      t.equal(
        exists2,
        false,
        'findRemoveSync(two files from root) removed randomFile2 fine'
      )

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(
        exists1_2_1_3,
        false,
        'findRemoveSync(two files from root) removed randomFile1_2_1_3 fine'
      )

      const exists1 = existsSync(randomFile1)
      t.equal(
        exists1,
        true,
        'findRemoveSync(two files from root) did not remove randomFile1'
      )

      const exists0 = existsSync(rootDirectory)
      t.equal(
        exists0,
        true,
        'findRemoveSync(two files from root) did not remove root directory'
      )

      t.done()
    },

    'findRemoveSync(files set to *.*)': function (t) {
      findRemoveSync(directory1_2_1, { files: '*.*' })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(files set to *.*) removed randomFile1_2_1_1 fine'
      )

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      t.equal(
        exists1_2_1_2,
        false,
        'findRemoveSync(files set to *.*) removed randomFile1_2_1_2 fine'
      )

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(
        exists1_2_1_3,
        false,
        'findRemoveSync(files set to *.*) removed randomFile1_2_1_3 fine'
      )

      const exists1_2_1 = existsSync(directory1_2_1)
      t.equal(
        exists1_2_1,
        true,
        'findRemoveSync(files set to *.* did not remove directory1_2_1'
      )

      t.done()
    },

    'findRemoveSync(with mixed ext and file params)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: randomFilename1,
        extensions: ['.log']
      })

      const exists1 = existsSync(randomFile1)
      const exists2 = existsSync(randomFile2)
      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1,
        false,
        'findRemoveSync(with mixed ext and file params) removed randomFile1 fine'
      )
      t.equal(
        exists2,
        false,
        'findRemoveSync(with mixed ext and file params) removed randomFile2 fine'
      )
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(with mixed ext and file params) removed randomFile1_2_1_1 fine'
      )

      const exists1_2_1 = existsSync(directory1_2_1)
      t.equal(exists1_2_1, true, 'did not remove directory1_2_1')

      t.strictEqual(
        typeof result[randomFile1],
        'boolean',
        'randomFile1 in result is boolean'
      )
      t.strictEqual(
        typeof result[randomFile1_2_1_2],
        'undefined',
        'randomFile1_2_1_2 is NOT in result'
      )

      t.done()
    },

    'findRemoveSync(with ignore param)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        ignore: fixFilename1_2_1_4
      })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(with ignore) did remove file randomFile1_2_1_1'
      )

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4)
      t.equal(exists1_2_1_4, true, 'file fixFile1_2_1_4 not removed')

      t.strictEqual(
        typeof result[randomFile1_2_1_1],
        'boolean',
        'randomFile1_2_1_1 in result is boolean'
      )
      t.strictEqual(
        typeof result[fixFile1_2_1_4],
        'undefined',
        'fixFile1_2_1_4 is NOT in result'
      )

      t.done()
    },

    'findRemoveSync(with ignore and jpg extension params)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        ignore: fixFilename1_2_1_4,
        extensions: '.jpg'
      })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      const exists1_2_1_4 = existsSync(fixFile1_2_1_4)
      t.equal(
        exists1_2_1_1,
        true,
        'findRemoveSync(with ignore + jpg extension) did not remove file randomFile1_2_1_1'
      )
      t.equal(
        exists1_2_1_4,
        true,
        'findRemoveSync(with ignore + jpg extension) did not remove file fixFile1_2_1_4'
      )
      t.strictEqual(
        typeof result[randomFile1_2_1_1],
        'undefined',
        'randomFile1_2_1_1 is NOT in result'
      )
      t.strictEqual(
        typeof result[fixFile1_2_1_4],
        'undefined',
        'fixFile1_2_1_4 is NOT in result'
      )

      t.done()
    },

    'findRemoveSync(with multiple ignore)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        ignore: [fixFilename1_2_1_4, fixFilename1_2_1_5]
      })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(with multiple ignore) did remove file randomFile1_2_1_1'
      )

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4)
      t.equal(
        exists1_2_1_4,
        true,
        'findRemoveSync(with multiple ignore) did not remove file fixFile1_2_1_4'
      )

      const exists1_2_1_5 = existsSync(fixFile1_2_1_5)
      t.equal(
        exists1_2_1_5,
        true,
        'findRemoveSync(with multiple ignore) did not remove file fixFile1_2_1_5'
      )

      t.strictEqual(
        typeof result[randomFile1_2_1_1],
        'boolean',
        'randomFile1_2_1_1 is in result'
      )
      t.strictEqual(
        typeof result[fixFile1_2_1_4],
        'undefined',
        'fixFile1_2_1_4 is NOT in result'
      )
      t.strictEqual(
        typeof result[fixFile1_2_1_5],
        'undefined',
        'fixFile1_2_1_5 is NOT in result'
      )

      t.done()
    },

    'findRemoveSync(with ignore and bak extension params)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        ignore: fixFilename1_2_1_4,
        extensions: '.bak'
      })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        true,
        'findRemoveSync(with ignore + bak extension) did not remove file randomFile1_2_1_1'
      )

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2)
      t.equal(
        exists1_2_1_2,
        false,
        'findRemoveSync(with ignore + bak extension) did remove file randomFile1_2_1_2'
      )

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4)
      t.equal(
        exists1_2_1_4,
        true,
        'findRemoveSync(with ignore + bak extension) did not remove file fixFile1_2_1_4'
      )

      t.strictEqual(
        typeof result[randomFile1_2_1_1],
        'undefined',
        'randomFile1_2_1_1 is NOT in result'
      )
      t.strictEqual(
        typeof result[randomFile1_2_1_2],
        'boolean',
        'randomFile1_2_1_2 is in result'
      )
      t.strictEqual(
        typeof result[fixFile1_2_1_4],
        'undefined',
        'fixFile1_2_1_4 is NOT in result'
      )

      t.done()
    },

    'findRemoveSync(two files and check others)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: [randomFilename1_2_1_1, randomFilename1_2_1_3]
      })

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        false,
        'findRemoveSync(two files and check others) removed randomFile1_2_1_1 fine'
      )

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(
        exists1_2_1_3,
        false,
        'findRemoveSync(two files and check others) removed randomFile1_2_1_3 fine'
      )

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4)
      t.equal(
        exists1_2_1_4,
        true,
        'findRemoveSync(two files and check others) did not remove fixFile1_2_1_4'
      )

      const exists1_2_1_5 = existsSync(fixFile1_2_1_5)
      t.equal(
        exists1_2_1_5,
        true,
        'findRemoveSync(two files and check others) did not remove fixFile1_2_1_5'
      )

      t.strictEqual(
        typeof result[randomFile1_2_1_1],
        'boolean',
        'randomFile1_2_1_1 is in result'
      )
      t.strictEqual(
        typeof result[randomFile1_2_1_3],
        'boolean',
        'randomFile1_2_1_3 is in result'
      )
      t.strictEqual(
        typeof result[fixFile1_2_1_4],
        'undefined',
        'fixFile1_2_1_4 is NOT in result'
      )
      t.strictEqual(
        typeof result[fixFile1_2_1_5],
        'undefined',
        'fixFile1_2_1_5 is NOT in result'
      )

      t.done()
    },

    'findRemoveSync(limit to maxLevel = 0)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        dir: '*',
        maxLevel: 0
      })

      t.strictEqual(
        Object.keys(result).length,
        0,
        'findRemoveSync(limit to maxLevel = 0) returned empty an array.'
      )

      t.done()
    },

    'findRemoveSync(limit to maxLevel = 1)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        dir: '*',
        maxLevel: 1
      })

      t.strictEqual(
        Object.keys(result).length,
        7,
        'findRemoveSync(limit to maxLevel = 1) returned 7 entries.'
      )

      t.done()
    },

    'findRemoveSync(limit to maxLevel = 2)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        dir: '*',
        maxLevel: 2
      })

      t.strictEqual(
        Object.keys(result).length,
        12,
        'findRemoveSync(limit to maxLevel = 2) returned 12 entries.'
      )

      t.done()
    },

    'findRemoveSync(limit to maxLevel = 3)': function (t) {
      const result = findRemoveSync(rootDirectory, { files: '*.*', maxLevel: 3 })

      t.strictEqual(
        Object.keys(result).length,
        6,
        'findRemoveSync(limit to maxLevel = 3) returned 6 entries.'
      )

      t.done()
    },

    'findRemoveSync(limit to maxLevel = 3 + bak only)': function (t) {
      const result = findRemoveSync(rootDirectory, { maxLevel: 3, extensions: '.bak' })

      t.strictEqual(
        Object.keys(result).length,
        2,
        'findRemoveSync(limit to maxLevel = 3 + bak only) returned 2 entries.'
      )

      t.done()
    },

    'findRemoveSync(single dir)': function (t) {
      findRemoveSync(rootDirectory, { dir: 'directory1_2' })

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, true, 'findRemoveSync(single dir) did not remove directory1_1')

      const exists1_2 = existsSync(directory1_2)
      t.equal(exists1_2, false, 'findRemoveSync(single dir) removed directory1_2')

      t.done()
    },

    'findRemoveSync(two directories)': function (t) {
      findRemoveSync(rootDirectory, { dir: ['directory1_1', 'directory1_2'] })

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, false, 'findRemoveSync(two dirs) removed directory1_1')

      const exists1_2 = existsSync(directory1_2)
      t.equal(exists1_2, false, 'findRemoveSync(two dirs) removed directory1_2')

      const exists1_3 = existsSync(directory1_3)
      t.equal(exists1_3, true, 'findRemoveSync(two dirs) did not remove directory1_3')

      t.done()
    },

    'findRemoveSync(directories with the same basename)': function (t) {
      findRemoveSync(rootDirectory, { dir: 'CVS' })

      const exists1_3 = existsSync(directory1_3)
      t.equal(
        exists1_3,
        false,
        'findRemoveSync(directories with the same basename) removed root/directory1/CVS'
      )

      const exists3 = existsSync(directory3)
      t.equal(
        exists3,
        false,
        'findRemoveSync(directories with the same basename) removed root/CVS'
      )

      const exists1_1 = existsSync(directory1_1)
      t.equal(
        exists1_1,
        true,
        'findRemoveSync(remove single dir) did not remove directory1_1'
      )

      const exists1_2 = existsSync(directory1_2)
      t.equal(
        exists1_2,
        true,
        'findRemoveSync(remove single dir) did not remove directory1_2'
      )

      t.done()
    },

    'findRemoveSync(test run)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        dir: '*',
        test: true
      })

      t.strictEqual(
        Object.keys(result).length,
        19,
        'findRemoveSync(test run) returned 19 entries.'
      )

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1)
      t.equal(
        exists1_2_1_1,
        true,
        'findRemoveSync(test run) did not remove randomFile1_2_1_1'
      )

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3)
      t.equal(
        exists1_2_1_3,
        true,
        'findRemoveSync(test run) did not remove randomFile1_2_1_3'
      )

      const exists1_1 = existsSync(directory1_1)
      t.equal(exists1_1, true, 'findRemoveSync(test run) did not remove directory1_1')

      t.done()
    }
  }),

  'TC 3: age checks': testCase({
    setUp: function (cb) {
      createFakeDirectoryTree(cb)
    },

    tearDown: function (cb) {
      destroyFakeDirectoryTree(cb)
    },

    'findRemoveSync(files and dirs older than 10000000000000000 sec)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        dir: '*',
        age: { seconds: 10000000000000000 }
      })

      t.strictEqual(
        Object.keys(result).length,
        0,
        'findRemoveSync(files older than 10000000000000000 sec) returned zero entries.'
      )

      t.done()
    },

    'findRemoveSync(files and dirs older than 10 sec)': function (t) {
      const result = findRemoveSync(rootDirectory, {
        files: '*.*',
        dir: '*',
        age: { seconds: 10 }
      })

      t.strictEqual(
        Object.keys(result).length,
        0,
        'findRemoveSync(files older than 10 sec) returned zero entries.'
      )

      t.done()
    },

    'findRemoveSync(files older than 2 sec with wait)': function (t) {
      setTimeout(function () {
        const result = findRemoveSync(rootDirectory, {
          files: '*.*',
          age: { seconds: 2 }
        })

        t.strictEqual(
          Object.keys(result).length,
          11,
          'findRemoveSync(files older than 2 sec with wait) returned 11 entries.'
        )

        t.done()
      }, 2100)
    },

    'findRemoveSync(files older than 2 sec with wait + maxLevel = 1)': function (t) {
      setTimeout(function () {
        const result = findRemoveSync(rootDirectory, {
          files: '*.*',
          maxLevel: 1,
          age: { seconds: 2 }
        })

        t.strictEqual(
          Object.keys(result).length,
          4,
          'findRemoveSync(files older than 2 sec with wait + maxLevel = 1) returned 4 entries.'
        )

        t.done()
      }, 2100)
    }
  }),

  'TC 4: github issues': testCase({
    setUp: function (cb) {
      createFakeDirectoryTree(cb)
    },

    tearDown: function (cb) {
      destroyFakeDirectoryTree(cb)
    },

    // from https://github.com/binarykitchen/find-remove/issues/7
    'findRemoveSync(issues/7a)': function (t) {
      setTimeout(function () {
        const result = findRemoveSync(rootDirectory, {
          age: { seconds: 2 },
          extensions: '.csv'
        })

        t.strictEqual(
          Object.keys(result).length,
          2,
          'findRemoveSync(issues/7) deleted 2 files.'
        )

        t.done()
      }, 3 * 1000)
    },

    // from https://github.com/binarykitchen/find-remove/issues/7
    'findRemoveSync(issues/7b)': function (t) {
      const result = findRemoveSync(rootDirectory, { extensions: '.dontexist' })

      t.deepEqual(result, {}, 'is an empty json')

      t.done()
    }
  }),

  'TC 5: limit checks': testCase({
    setUp: function (cb) {
      createFakeDirectoryTree(cb)
    },

    tearDown: function (cb) {
      destroyFakeDirectoryTree(cb)
    },

    'findRemoveSync(files older with limit of 2)': function (t) {
      const result = findRemoveSync(rootDirectory, { files: '*.*', limit: 2 })

      t.strictEqual(
        Object.keys(result).length,
        2,
        'findRemoveSync(files with limit of 2) returned 2 entries (out of 11).'
      )

      t.done()
    },

    'findRemoveSync(files and dirs with limit of 5)': function (t) {
      const result = findRemoveSync(rootDirectory, { files: '*.*', dir: '*', limit: 5 })

      t.strictEqual(
        Object.keys(result).length,
        5,
        'findRemoveSync(files and dirs with limit of 5) returned 5 entries (out of 19).'
      )

      t.done()
    }
  }),

  'TC 6: prefix checks': testCase({
    setUp: function (cb) {
      createFakeDirectoryTree(cb)
    },

    tearDown: function (cb) {
      destroyFakeDirectoryTree(cb)
    },

    'findRemoveSync(files with exiting prefix "someth")': function (t) {
      const result = findRemoveSync(rootDirectory, { prefix: 'someth' })

      t.strictEqual(
        Object.keys(result).length,
        2,
        'findRemoveSync(files with prefix "someth") returned 2 entries (out of 11).'
      )

      t.done()
    },

    'findRemoveSync(files with non-existing prefix "ssssssssssssssssssssssssss" - too many chars)': function (
      t
    ) {
      const result = findRemoveSync(rootDirectory, {
        prefix: 'ssssssssssssssssssssssssss'
      })

      t.strictEqual(
        Object.keys(result).length,
        0,
        'findRemoveSync(files with non-existing prefix "ssssssssssssssssssssssssss"- too many chars) returned 0 entries (out of 11).'
      )

      t.done()
    }
  })
})
