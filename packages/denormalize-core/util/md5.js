// denormalize <https://github.com/msikma/denormalize>
// © MIT license

const crypto = require('crypto')
const md5File = require('md5-file')

/**
 * Returns the MD5 hash of a buffer.
 */
const bufferMD5 = buffer => {
  return crypto.createHash('md5').update(buffer).digest('hex')
}

/**
 * Returns the MD5 hash of the contents of a binary file by its path.
 */
const fileMD5 = filepath => {
  return md5File(filepath)
}

module.exports = {
  bufferMD5,
  fileMD5
}
