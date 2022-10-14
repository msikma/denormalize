// denormalize <https://github.com/msikma/denormalize>
// © MIT license

const types = {
  '0XFS': 'sfx'
}

/**
 * Returns the magic string at the start of a file buffer.
 */
const getMagicString = (buffer) => {
  // Return the first 4 bytes interpreted as ASCII.
  return new TextDecoder('us-ascii').decode(new DataView(buffer, 0, 4))
}

/**
 * Verifies that a buffer's magic string matches a given type.
 */
const verifyMagic = (buffer, type) => {
  const magic = getMagicString(buffer)
  if (types[magic] !== type) {
    throw new Error(`Not a valid ${type.toUpperCase()} file; need "${Object.entries(types).find(pair => pair[1] === type)[0]}" magic number, got: ${magic}`)
  }
}

module.exports = {
  verifyMagic,
  getMagicString
}
