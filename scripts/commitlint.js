'use strict'

const { execSync } = require('child_process');

const currentBranch = execSync('git symbolic-ref --short HEAD', { encoding: 'utf-8' }).trim();
const remoteBranch = `origin/${currentBranch}`;

const command = `npx commitlint --from="${remoteBranch}" --to=HEAD`;

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exitCode = error.status;
}