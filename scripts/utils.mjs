import fs from 'fs'
import path from 'path'
import url from 'url'
import chalk from 'chalk'
import { execSync } from 'child_process'

export const logSuccess = (message) => console.log(`✅ ${chalk.green(message)}`)
export const logError = (message) => console.error(`❌ ${chalk.red(message)}`)
export const logWarning = (message) => console.log(`⚠️ ${chalk.yellow(message)}`)
export const logInfo = (message) => console.log(`ℹ️ ${chalk.cyan(message)}`)
export const logProgress = (message) => console.log(`🔄 ${chalk.magenta(message)}`)
export const logPlain = (message) => console.log(message)

export const validateFileExists = (filePath, description = 'File') => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${description} not found at: ${filePath}`)
  }
}

export const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true })
  }
}

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(2))} ${sizes[index]}`
}

export const basePath = (relative) => {
  const __dirname = path.dirname(
    url.fileURLToPath(import.meta.url)
  )

  return path.resolve(__dirname, '..', relative)
}

export function latestGitTag () {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim()
  } catch {
    const defaultTag = '0.0.0'
    logWarning(`Could not get git tag. Defaulting to version ${defaultTag}`)
    return defaultTag
  }
}

export function shouldExcludeFile (fileName) {
  return fileName.endsWith('.map') || fileName.startsWith('.')
}

export function loadEnvironmentVariable (variableName) {
  const value = process.env[variableName]

  if (!value) {
    throw new Error(`${variableName} environment variable is required`)
  }

  return value
}
