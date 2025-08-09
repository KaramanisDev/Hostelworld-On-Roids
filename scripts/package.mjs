import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import Crx from 'crx'
import { config } from 'dotenv'
import {
  logInfo, logSuccess, logError,
  validateFileExists, ensureDirectory, basePath,
  latestGitTag, formatBytes, logProgress, shouldExcludeFile
} from './utils.mjs'

config({ quiet: true })

const packageFilePrefix = 'hostelworld-on-roids-extension'

async function main () {
  try {
    const options = parseArguments()

    validateDistributionDirectory()

    const { outputPath, size } = await createPackage(options.type)

    logSuccess(`${options.type.toUpperCase()} package created successfully at: ${outputPath}`)
    logInfo(`Package size: ${formatBytes(size)}`)
  } catch (error) {
    logError(`Package creation failed: ${error.message}`)
    process.exit(1)
  }
}

function parseArguments () {
  return yargs(hideBin(process.argv))
    .option('type', {
      alias: 't',
      description: 'Type of package to create',
      type: 'string',
      demandOption: true,
      choices: ['zip', 'crx']
    })
    .help()
    .alias('help', 'h')
    .example('$0 -t zip', 'Create a ZIP package')
    .example('$0 -t crx', 'Create a signed CRX package (requires CRX_PRIVATE_KEY_PATH in .env)')
    .argv
}

function validateDistributionDirectory () {
  const manifestPath = basePath('dist/manifest.json')

  validateFileExists(manifestPath, 'manifest.json in dist folder. Please build the extension first')

  ensureDirectory(basePath('packages'))
}

async function createPackage (type) {
  logProgress(`Creating ${type.toUpperCase()} package...`)

  switch (type) {
    case 'zip':
      return await createZipPackage()
    case 'crx':
      return await createCrxPackage()
    default:
      throw new Error(`Unsupported package type: ${type}`)
  }
}

async function createZipPackage () {
  const outputFilename = `${packageFilePrefix}-${latestGitTag()}.zip`
  const outputPath = basePath(`packages/${outputFilename}`)

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
      resolve({
        outputPath,
        size: archive.pointer()
      })
    })

    archive.on('error', reject)
    archive.pipe(output)

    archive.directory(basePath('dist'), false, (entry) => {
      return shouldExcludeFile(entry.name) ? false : entry
    })

    archive.finalize()
  })
}

function loadCrxPrivateKeyPath () {
  const environmentPath = process.env.CRX_PRIVATE_KEY_PATH

  if (!environmentPath) {
    throw new Error('CRX_PRIVATE_KEY_PATH environment variable is required for CRX packaging')
  }
  return basePath(environmentPath)
}

async function copyFilteredFiles (sourceDirectory, targetDirectory) {
  const entries = fs.readdirSync(sourceDirectory, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name)
    const targetPath = path.join(targetDirectory, entry.name)

    if (shouldExcludeFile(entry.name)) {
      continue
    }

    if (entry.isDirectory()) {
      ensureDirectory(targetPath)
      await copyFilteredFiles(sourcePath, targetPath)
    } else {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

async function createCrxPackage () {
  const pemPath = loadCrxPrivateKeyPath()
  validateFileExists(pemPath, 'CRX private key file')

  const temporaryDirectory = basePath('packages/temp-crx-build')
  ensureDirectory(temporaryDirectory)

  try {
    await copyFilteredFiles(basePath('dist'), temporaryDirectory)

    const crx = new Crx({
      privateKey: fs.readFileSync(pemPath)
    })

    const loadedCrx = await crx.load(temporaryDirectory)
    const crxBuffer = await loadedCrx.pack()

    const outputFilename = `${packageFilePrefix}-${latestGitTag()}.crx`
    const outputPath = basePath(`packages/${outputFilename}`)
    fs.writeFileSync(outputPath, crxBuffer)

    return {
      outputPath,
      size: crxBuffer.length
    }
  } finally {
    if (fs.existsSync(temporaryDirectory)) {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true })
    }
  }
}

void main()
