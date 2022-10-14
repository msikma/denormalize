// denormalize <https://github.com/msikma/denormalize>
// © MIT license

const fs = require('fs').promises

/**
 * Returns the point at which the string data starts.
 */
const getStartOffset = dataView => {
  // The first uint32 in the file points to the start of the strings table.
  return dataView.getUint32(0, true)
}

/**
 * Returns an array of string addresses by index.
 */
const getAddressList = (dataView, startOffset) => {
  const addressList = []

  // Iterate over all uint32 addresses.
  for (let n = 0; n < startOffset / 4; ++n) {
    const offset = n * 4
    const address = dataView.getUint32(offset, true)
    addressList.push([n, address])
  }

  return addressList
}

/**
 * Returns an object with addresses
 */
const getAddressTable = addressList => {
  // Filter out addresses that don't point to anything.
  const usedAddresses = addressList.filter(address => address[1] !== 0x00)
  const unusedAddresses = addressList.filter(address => address[1] === 0x00)

  return [Object.fromEntries(usedAddresses.map(address => [address[1], address[0]])), unusedAddresses, usedAddresses]
}

/**
 * Scans the LANG.DAT buffer at a particular offset to extract a single string.
 * 
 * Returns the string, the offset at which the next string starts, whether this is the last string
 * in the file, and whether the string is orphaned or not.
 */
const scanString = (dataView, startOffset, byteLength, addressTable) => {
  const stringChars = []
  const isOrphaned = addressTable[startOffset] == null

  for (let offset = startOffset; offset < byteLength; ++offset) {
    const char = dataView.getUint8(offset, true)

    // Collect the character.
    if (char > 0x00) {
      stringChars.push(char)
    }

    // If we've hit the terminator, finalize the string and return it.
    // We also return the next offset after this, which is where the next string starts.
    // If this offset is equal to the end of the file, it means we're finished.
    // If we can't find an entry for this offset in the address table, that means
    // this is an orphaned string.
    if (char === 0x00) {
      const nextOffset = offset + 1
      return [stringChars, nextOffset, nextOffset === byteLength, isOrphaned]
    }
  }

  // If we've reached here, we're probably not looking at a valid LANG.DAT type file.
  throw new Error(`Reached EOF while scanning string`)
}

/**
 * Unpacks language strings from a LANG.DAT (or similar) file.
 * 
 * These files are structured in two parts: first, a list of string addresses (uint32) that indicate
 * where in the file a string can be found, followed by a list of the actual strings, null-terminated.
 * 
 * The first address points to the start of the strings section.
 */
const unpackLangStrings = (buffer, encoding = 'us-ascii') => {
  const textDecoder = new TextDecoder(encoding)
  const dataView = new DataView(buffer)

  const startOffset = getStartOffset(dataView)
  const addressList = getAddressList(dataView, startOffset)
  const [addressTable, unusedAddresses] = getAddressTable(addressList)

  const data = {
    // Strings by their index.
    indexedStrings: [],
    // Strings that don't seem to be linked to any address.
    orphanStrings: []
  }

  let offset = startOffset
  while (true) {
    const [stringChars, nextOffset, isComplete, isOrphaned] = scanString(dataView, offset, buffer.byteLength, addressTable)
    const stringDecoded = textDecoder.decode(Uint8Array.from(stringChars))

    // Store the string either in the list of orphaned strings, or in the list of indexed strings.
    data[isOrphaned ? 'orphanStrings' : 'indexedStrings'].push({string: stringDecoded, offset, n: addressTable[offset]})

    if (isComplete) {
      break
    }

    offset = nextOffset
  }

  return {
    ...data,
    metadata: {
      length: buffer.byteLength,
      stringOffset: startOffset,
      unusedAddresses: unusedAddresses.map(address => address[0])
    }
  }
}

/**
 * Returns language strings extracted from a LANG.DAT file.
 */
const getLangStrings = async (filepath) => {
  const bin = await fs.readFile(filepath, null)
  return unpackLangStrings(bin.buffer)
}

module.exports = {
  getLangStrings
}
