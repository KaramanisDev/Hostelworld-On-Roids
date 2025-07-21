import { execSync } from 'node:child_process'

let currentBranch

try {
  currentBranch = process.argv[2] || execSync('git symbolic-ref --short HEAD', {
    encoding: 'utf8'
  }).trim()
} catch {
  console.error('❌ Failed to determine current branch. Use: yarn lint:commit <branch>')
  process.exit(1)
}

const remoteBranch = `origin/${currentBranch}`
const command = `npx commitlint --from="${remoteBranch}" --to=HEAD`

try {
  execSync(command, { stdio: 'inherit' })
} catch (error) {
  process.exitCode = error.status
}
