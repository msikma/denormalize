// denormalize <https://github.com/msikma/denormalize>
// © MIT license

const Denormalize = require('denormalize-core')

/**
 * Processes user arguments from the command line and runs parts of the library.
 */
const runFromCli = async (args) => {
  if (args.pathIdentify) {
    const data = await Denormalize.identifyBinary(args.pathIdentify)
    if (args.outputJSON) {
      return console.log(JSON.stringify(data, null, 2))
    }
    console.log(Denormalize.getIdentityString(data))
  }
  if (args.pathExtractLangFile) {
    const data = await Denormalize.getLangStrings(args.pathExtractLangFile)
    return console.log(JSON.stringify(data, null, 2))
  }
  if (args.pathExtractSoundFile) {
    const data = await Denormalize.getSoundBuffers(args.pathExtractSoundFile)
    console.log(data)
    //return console.log(JSON.stringify(data, null, 2))
  }
}

module.exports = {
  runFromCli
}
