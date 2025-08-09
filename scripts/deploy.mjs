import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { config } from 'dotenv'
import {
  logInfo, logSuccess, logError, logProgress,
  loadEnvironmentVariable, validateFileExists,
  formatBytes, basePath, latestGitTag
} from './utils.mjs'

config({ quiet: true })

const packageFilePrefix = 'hostelworld-on-roids-extension'

async function main () {
  try {
    const options = parseArguments()

    if (!options.upload && !options.publish) {
      throw new Error('At least one of --upload or --publish must be specified')
    }

    const version = latestGitTag()
    const packagePath = getPackagePath(version)

    validateFileExists(packagePath, `Package file for version ${version}`)

    if (options.upload && options.publish) {
      await deployExtension(packagePath, version)
      logSuccess('Extension uploaded and submitted for review successfully.')
      return
    }

    if (options.upload) {
      await uploadExtension(packagePath, version)
      logSuccess('Extension uploaded successfully.')
      return
    }

    await publishExtension()
    logSuccess('Extension submitted for review successfully.')
  } catch (error) {
    logError(`Deploy failed: ${error.message}`)
    process.exit(1)
  }
}

function parseArguments () {
  return yargs(hideBin(process.argv))
    .option('upload', {
      alias: 'u',
      description: 'Upload the extension to Chrome Web Store',
      type: 'boolean',
      default: false
    })
    .option('publish', {
      alias: 'p',
      description: 'Submit the extension for review and publication',
      type: 'boolean',
      default: false
    })
    .help()
    .alias('help', 'h')
    .example('$0 --upload', 'Upload latest version to Chrome Web Store')
    .example('$0 --publish', 'Submit latest version for review')
    .example('$0 --upload --publish', 'Upload and submit latest version for review')
    .example('$0 -u -p', 'Upload and submit latest version for review (short form)')
    .argv
}

function getPackagePath (version) {
  return basePath(`packages/${packageFilePrefix}-${version}.zip`)
}

function loadChromeWebStoreCredentials () {
  const clientId = loadEnvironmentVariable('CHROME_WEB_STORE_CLIENT_ID')
  const clientSecret = loadEnvironmentVariable('CHROME_WEB_STORE_CLIENT_SECRET')
  const refreshToken = loadEnvironmentVariable('CHROME_WEB_STORE_REFRESH_TOKEN')
  const appId = loadEnvironmentVariable('CHROME_WEB_STORE_APP_ID')

  return { clientId, clientSecret, refreshToken, appId }
}

async function getAccessToken (credentials) {
  logProgress('Getting Chrome Web Store access token...')

  const tokenUrl = 'https://oauth2.googleapis.com/token'

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: 'refresh_token'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`)
  }

  const tokenData = await response.json()
  return tokenData.access_token
}

async function deployExtension (packagePath, version) {
  const credentials = loadChromeWebStoreCredentials()
  const accessToken = await getAccessToken(credentials)

  await uploadPackageToWebStore(packagePath, version, credentials, accessToken)
  await publishToWebStore(credentials, accessToken)
}

async function uploadExtension (packagePath, version) {
  const credentials = loadChromeWebStoreCredentials()
  const accessToken = await getAccessToken(credentials)

  await uploadPackageToWebStore(packagePath, version, credentials, accessToken)
}

async function publishExtension () {
  const credentials = loadChromeWebStoreCredentials()
  const accessToken = await getAccessToken(credentials)

  await publishToWebStore(credentials, accessToken)
}

async function uploadPackageToWebStore (packagePath, version, credentials, accessToken) {
  logProgress('Reading package file...')
  const packageBuffer = fs.readFileSync(packagePath)
  const packageSize = packageBuffer.length

  logInfo(`Package: ${packageFilePrefix}-${version}.zip`)
  logInfo(`Package size: ${formatBytes(packageSize)}`)
  logProgress('Uploading package to Chrome Web Store...')

  const uploadUrl = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${credentials.appId}`

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-goog-api-version': '2'
    },
    body: packageBuffer
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Upload failed: ${response.status} ${errorText}`)
  }

  const result = await response.json()

  if (result.uploadState !== 'SUCCESS') {
    for (const error of result.itemError || []) {
      logError(`- ${error.error_detail}`)
    }

    throw new Error(`Upload failed with state: ${result.uploadState}`)
  }

  logSuccess('Package uploaded successfully')
  logInfo(`Upload ID: ${result.id}`)

  if (!result.itemError || result.itemError.length === 0) {
    return
  }

  logError('Upload completed with warnings:')
  for (const error of result.itemError) {
    logError(`- ${error.error_detail}`)
  }
}

async function publishToWebStore (credentials, accessToken) {
  logProgress('Publishing extension to Chrome Web Store...')

  const publishUrl = `https://www.googleapis.com/chromewebstore/v1.1/items/${credentials.appId}/publish`

  const response = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-goog-api-version': '2'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Publish failed: ${response.status} ${errorText}`)
  }

  const result = await response.json()

  if (!result.status || !result.status.includes('OK')) {
    throw new Error(`Publish failed with status: ${result.status || 'Unknown'}`)
  }

  logSuccess('Extension submitted for review and publication')

  if (!result.statusDetail || result.statusDetail.length === 0) {
    return
  }

  for (const detail of result.statusDetail) {
    logInfo(detail)
  }
}

void main()
