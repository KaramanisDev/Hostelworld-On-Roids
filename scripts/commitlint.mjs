import { execSync } from 'node:child_process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { logSuccess, logError } from './utils.mjs'

async function main () {
  try {
    const options = parseArguments()
    const fromRevision = options.from ?? `origin/${getCurrentBranch(options.branch)}`

    lintCommits(fromRevision)

    logSuccess('All commits passed the linting rules.')
  } catch (error) {
    if (error.message && error.message.includes('yarn commitlint')) {
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
    .option('from', {
      alias: 'f',
      description: 'Commit to lint after (takes precedence over --branch)',
      type: 'string'
    })
    .help()
    .alias('help', 'h')
    .example('$0', 'Lint commits on current branch against origin')
    .example('$0 --branch master', 'Lint commits against origin/master')
    .example('$0 --from 1a2b3c4', 'Lint commits after 1a2b3c4')
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

function lintCommits (fromRevision) {
  const command = `yarn commitlint --from="${fromRevision}" --to=HEAD`

  execSync(command, { stdio: 'inherit' })
}

void main()
