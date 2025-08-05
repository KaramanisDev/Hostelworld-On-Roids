import { execSync } from 'node:child_process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { logSuccess, logError } from './utils.mjs'

async function main () {
  try {
    const options = parseArguments()
    const currentBranch = getCurrentBranch(options.branch)

    lintCommits(currentBranch, options.verbose)

    logSuccess('All commits passed the linting rules.')
  } catch (error) {
    if (error.message && error.message.includes('npx commitlint')) {
      logError('Commit linting has failed. Please address the issues above.')
    } else {
      logError(`Unexpected error: ${error.message}`)
    }
    process.exit(1)
  }
}

function parseArguments () {
  return yargs(hideBin(process.argv))
    .option('branch', {
      alias: 'b',
      description: 'Branch to lint commits against',
      type: 'string'
    })
    .help()
    .alias('help', 'h')
    .example('$0', 'Lint commits on current branch against origin')
    .example('$0 --branch master', 'Lint commits against origin/master')
    .argv
}

function getCurrentBranch (providedBranch) {
  if (providedBranch) {
    return providedBranch
  }

  try {
    return execSync('git symbolic-ref --short HEAD', {
      encoding: 'utf8'
    }).trim()
  } catch {
    throw new Error('Failed to determine current branch. Please specify branch explicitly.')
  }
}

function lintCommits (branch) {
  const remoteBranch = `origin/${branch}`
  const command = `npx commitlint --from="${remoteBranch}" --to=HEAD`

  execSync(command, { stdio: 'inherit' })
}

void main()
