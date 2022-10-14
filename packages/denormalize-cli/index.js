// denormalize <https://github.com/msikma/denormalize>
// © MIT license

const fs = require('fs').promises
const path = require('path')
const {ArgumentParser} = require('argparse')

const main = async () => {
  const pkgPath = path.join(__dirname, '..', '..', 'package.json')
  const pkgData = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
  const cliParser = new ArgumentParser({
    version: pkgData.version,
    addHelp: true,
    addVersion: true,
    description: `${pkgData.description}`,
    epilog: 'Send questions and comments to @dada78641 on Twitter.'
  })

  cliParser.addArgument(['--xsfx'], {help: 'Extract sound effects (from e.g. EUREKA0.SFX).', metavar: 'PATH', dest: 'pathExtractSoundFile'})
  cliParser.addArgument(['--xlang'], {help: 'Extract language strings (from e.g. LANG.DAT).', metavar: 'PATH', dest: 'pathExtractLangFile'})
  cliParser.addArgument(['--identify'], {help: 'Identifies an installation or CD of Normality or RotH.', metavar: 'PATH', dest: 'pathIdentify'})
  cliParser.addArgument(['-j', '--json'], {help: 'Outputs data as JSON (if applicable).', action: 'storeTrue', dest: 'outputJSON'})
  
  // Parse command line arguments; if something is wrong, the program exits here.
  const args = {...cliParser.parseArgs(), pathPackage: path.resolve(path.dirname(pkgPath)), packageData: pkgData}
  
  require('./run').runFromCli(args)
}

main()
