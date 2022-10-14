// denormalize <https://github.com/msikma/denormalize>
// © MIT license

const fs = require('fs').promises
const {bufferMD5} = require('../util/md5')

/**
 * Retrieves data from an .sfx file buffer header.
 */
const getSfxHeader = (buffer) => {
  const headerView = new DataView(buffer)

  // Unknown; always 1.
  const uUnknown = headerView.getUint32(4, true)
  // Offset where sound data starts.
  const uSoundsOffset = headerView.getUint32(8, true)
  // Size of the sound data plus everything after.
  const uSoundsSizePlusData = headerView.getUint32(12, true)
  // Size of the sound data.
  const uSoundsSize = headerView.getUint32(16, true)
  // Offset where the names data starts.
  const uNamesOffset = headerView.getUint32(20, true)
  // Size of the names data.
  const uNamesSize = headerView.getUint32(24, true)

  return {
    uUnknown,
    uSoundsOffset,
    uSoundsSizePlusData,
    uSoundsSize,
    uNamesOffset,
    uNamesSize
  }
}

/**
 * Retrieves sound data and returns them in an object, listed by ID.
 */
const getSoundData = (buffer, uSoundsOffset, uSoundsSize) => {
  const sounds = {}

  for (let offset = 0; offset < uSoundsSize; offset += 12) {
    const soundView = new DataView(buffer, uSoundsOffset + offset, 12)
    const dataAddress = soundView.getUint32(0, true)
    const dataSize = soundView.getUint32(4, true)
    const id = soundView.getUint32(8, true)
    const data = buffer.slice(dataAddress, dataAddress + dataSize)

    sounds[id] = {
      id,
      data: Buffer.from(data)
    }
  }

  return sounds
}

/**
 * Retrieves sound names.
 */
const getSoundNames = (buffer, sounds, uNamesOffset, encoding = 'us-ascii') => {
  const textDecoder = new TextDecoder(encoding)
  const names = {}
  
  let offset = uNamesOffset
  for (let n = 0; n < Object.keys(sounds).length; ++n) {
    const nameView = new DataView(buffer, offset)
    const id = nameView.getUint16(0, true)

    let byteN = 2
    let nameShort = []
    let nameLong = []

    while (true) {
      const byte = nameView.getUint8(byteN, true)
      byteN += 1
      if (byte !== 0x00) {
        nameShort.push(byte)
      }
      else break
    }

    while (true) {
      const byte = nameView.getUint8(byteN, true)
      byteN += 1
      if (byte !== 0x00) {
        nameLong.push(byte)
      }
      else break
    }
    
    names[id] = {
      id,
      nameShort: textDecoder.decode(Uint8Array.from(nameShort)),
      nameLong: textDecoder.decode(Uint8Array.from(nameLong))
    }
    offset += byteN
  }

  return names
}

/**
 * Returns all sound objects found in a .sfx file.
 */
const getSoundObjects = (buffer) => {
  const metadata = getSfxHeader(buffer)
  const {uSoundsOffset, uSoundsSize, uNamesOffset} = metadata

  // Retrieve sound data and name data.
  const sounds = getSoundData(buffer, uSoundsOffset, uSoundsSize)
  const names = getSoundNames(buffer, sounds, uNamesOffset)

  // Combine the two.
  const ids = Object.keys(sounds)
  const combined = ids.map(id => ({...names[id], ...sounds[id], md5: bufferMD5(sounds[id].data)}))

  return {
    soundObjects: combined,
    metadata
  }
}

/**
 * Returns 
 */
const getSoundBuffers = async (filepath) => {
  const bin = await fs.readFile(filepath, null)
  return getSoundObjects(bin.buffer)
}

module.exports = {
  getSoundBuffers
}
