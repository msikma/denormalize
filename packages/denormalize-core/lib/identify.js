// denormalize <https://github.com/msikma/denormalize>
// © MIT license

const fs = require('fs').promises
const path = require('path')
const {fileMD5} = require('../util/md5')

const knownGames = {
  /** Retail versions. */
  'UK_RETAIL': {
    'type': 'Normality',
    'qa': 'v1.0',
    'compilation': '206596 Monday 6-5-1996 20:22',
    'adventure': '17230496',
    'identity': 'Retail (UK release)'
  },
  'US_RETAIL': {
    'type': 'Normality',
    'qa': 'US V.F6',
    'compilation': '10090796 Tuesday 9-7-1996 10:45',
    'adventure': '17230496',
    'identity': 'Retail (US release)'
  },
  'DE_RETAIL': {
    'type': 'Normality',
    'qa': 'German V.1.2',
    'compilation': '2124596 Friday 24-5-1996 21:24',
    'adventure': '17230496',
    'identity': 'Retail (DE release)'
  },

  /** Demos and prototypes. */
  'US_INTERPLAY_DEMO': {
    'type': 'Normality',
    'qa': 'Interplay Demo',
    'compilation': '1429396 Friday 29-3-1996 14:17',
    'adventure': '11280396',
    'identity': 'Interplay Demo (US)'
  },
  'UK_GREMLIN_DEMO': {
    'type': 'Normality',
    'qa': 'Gremlin Demo',
    'compilation': '1211496 Thursday 11-4-1996 12:13',
    'adventure': '18100496',
    'identity': 'Gremlin Demo'
  },
  'UK_LATER_DEMO': {
    'type': 'Normality',
    'qa': null,
    'compilation': '16241195 Friday 24-11-1995 16:22',
    'adventure': '14241195',
    'identity': 'Later Demo'
  },
  'UK_EARLY_DEMO': {
    'type': 'Normality',
    'qa': null,
    'compilation': '10141195 Tuesday 14-11-1995 10:44',
    'adventure': '17091195',
    'identity': 'Early Demo'
  },
}

const knownChecksums = {
  '57c595d94b424b155b15faf091f5716b': 'UK_RETAIL'
}

/**
 * Returns a binary's identity data by its path.
 */
const identifyBinary = async (filepath) => {
  // Check to ensure this is a file.
  const stats = await fs.lstat(filepath)
  if (!stats.isFile()) {
    throw new Error(`Given path does not point to a file: ${filepath}`)
  }
  // Return information about the game by the binary's checksum.
  return getIdentityData(await identifyByChecksum(filepath), filepath, stats)
}

/**
 * Returns a binary's identity by its md5 checksum.
 */
const identifyByChecksum = async (filepath) => {
  const md5 = await fileMD5(filepath)
  const type = knownChecksums[md5]
  const info = knownGames[type]
  return {info, type, md5}
}

/**
 * Returns full identity data for a binary in the form of an object.
 */
const getIdentityData = (identity, filepath, stats) => {
  const {info, type, md5} = identity
  const parsed = path.parse(filepath)
  return {
    isKnownVersion: !!type,
    file: parsed.base,
    game: info?.type,
    identity: info?.identity,
    qa: info?.qa,
    compilation: info?.compilation,
    adventure: info?.adventure,
    md5,
    size: `${stats.size}`,
    type
  }
}

/**
 * Returns a string of human-readable identity data for a binary.
 */
const getIdentityString = (identityData) => {
  // If we don't have a type, this is not a known version of Normality or RotH.
  if (!identityData.isKnownVersion) {
    return `
File:          ${identityData.file}
  MD5:         ${identityData.md5}
  Size:        ${identityData.size}

This is not a known version of Normality. 
    `.trim()
  }
  return `
File:          ${identityData.file}
Game:          ${identityData.type} - ${identityData.identity}
  QA:          ${identityData.qa}
  Compilation: ${identityData.compilation}
  Adventure:   ${identityData.adventure}
  MD5:         ${identityData.md5}
  Size:        ${identityData.size}
  Type:        ${identityData.type}

This is a known version of Normality.
  
  `.trim()
}

module.exports = {
  identifyBinary,
  getIdentityData,
  getIdentityString
}
