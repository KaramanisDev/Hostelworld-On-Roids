import path from 'path'
import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { config } from 'dotenv'
import forge from 'node-forge'
import {
  logProgress, logSuccess, logInfo, logWarning, logPlain, logError,
  ensureDirectory, basePath
} from './utils.mjs'

config({ quiet: true })

async function main () {
  try {
    const options = parseArguments()
    const keyPath = options.keyPath || getCrxKeyPath()

    createOrDisplayCrxKey(keyPath, options.recreate)

    logSuccess('CRX key operation completed successfully.')
  } catch (error) {
    logError(`CRX key operation failed: ${error.message}`)
    process.exit(1)
  }
}

function parseArguments () {
  return yargs(hideBin(process.argv))
    .option('path', {
      alias: 'p',
      description: 'Path to the private key file',
      type: 'string'
    })
    .option('recreate', {
      alias: 'r',
      description: 'recreate key even if it exists (with backup)',
      type: 'boolean',
      default: false
    })
    .help()
    .alias('help', 'h')
    .example('$0', 'create or display CRX key using CRX_PRIVATE_KEY_PATH')
    .example('$0 --path ./my-key.pem', 'Use custom key path')
    .example('$0 --recreate', 'Force recreate existing key (with backup)')
    .argv
}

function getCrxKeyPath () {
  const environmentPath = process.env.CRX_PRIVATE_KEY_PATH

  if (environmentPath) {
    return basePath(environmentPath)
  }

  const defaultPath = basePath('crx-private-key.pem')
  logWarning('CRX_PRIVATE_KEY_PATH not set in environment. Using default: crx-private-key.pem')

  return defaultPath
}

function createOrDisplayCrxKey (keyPath, shouldRecreate) {
  const keyExists = fs.existsSync(keyPath)
  let publicCrxKey

  if (keyExists) {
    logInfo('CRX private key already exists')

    if (shouldRecreate) {
      logWarning('Recreating existing private key...')

      const backupPath = backUpKey(keyPath)
      logInfo(`Existing key backed up to: ${backupPath}`)

      publicCrxKey = createAndStore(keyPath)
    } else {
      publicCrxKey = extractPublicKey(keyPath)
    }
  } else {
    logInfo('CRX private key does not exist')

    publicCrxKey = createAndStore(keyPath)
  }

  displayPublicKey(publicCrxKey, keyPath)
  displayUsageInstructions(keyPath)
}

function createAndStore (keyPath) {
  const { privateKeyPem, publicKeyPem } = generateRsaKeyPair()
  ensureDirectory(path.dirname(keyPath))
  savePrivateKey(privateKeyPem, keyPath)

  return publicKeyPem
}

function backUpKey (keyPath) {
  const backupPath = `${keyPath}.backup.${Date.now()}`
  fs.copyFileSync(keyPath, backupPath)

  return backupPath
}

function generateRsaKeyPair () {
  logProgress('Generating new RSA private key...')

  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 })

  return {
    privateKeyPem: forge.pki.privateKeyToPem(keyPair.privateKey),
    publicKeyPem: forge.pki.publicKeyToPem(keyPair.publicKey)
  }
}

function savePrivateKey (privateKeyPem, keyPath) {
  fs.writeFileSync(keyPath, privateKeyPem, { mode: 0o600 })
  logSuccess(`Private key created successfully at: ${keyPath}`)
}

function extractPublicKey (privateKeyPath) {
  const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf8')
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
  const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e)
  return forge.pki.publicKeyToPem(publicKey)
}

function displayPublicKey (publicKeyPem, keyPath) {
  logInfo('CRX Private Key Information:')
  logInfo(`Private key location: ${keyPath}`)
  logInfo('Public key (PEM format):')

  const publicKeyLines = publicKeyPem.split('\n')
  publicKeyLines.forEach(line => {
    logPlain(`  ${line}`)
  })
}

function displayUsageInstructions (keyPath) {
  logPlain('')
  logInfo('Usage Instructions:')
  logPlain('  1. Add to your .env file:')
  logPlain(`     CRX_PRIVATE_KEY_PATH=${path.relative(basePath('.'), keyPath)}`)
  logPlain('  2. Use the public key above in Chrome Web Store Developer Dashboard')
  logPlain('  3. Keep the private key secure and never commit it to version control')
}

void main()
