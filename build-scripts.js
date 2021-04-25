#!/usr/bin/env node

const { program } = require('commander');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { readFileSync } = require('fs');

program
  .command('stage-release [newversion]')
  .description('Bump version and create a "release/[version]" branch')
  .action(stageRelease)
program
  .command('release [tagmessage]')
  .description('Tag and merge the latest release into master')
  .action(release)
program
  .command('publish-gh')
  .description('Push master and release branches to GitHub with tags')
  .action(publishGH)
program.parse(process.argv);

/* ----- HELPER ----- */

function getVersion() {
  // Uses readFileSync() instead of require() to prevent caching of values.
  const pkg = JSON.parse(readFileSync('./package.json'));
  return pkg.version;
}

function getReleaseBranch() {
  return `release-${getVersion()}`;
}

/* ----- SUBTASKS ----- */

// Merge the specified branch back into master.
function mergeBranch(branch) {
  console.log('Merging release into master.')
  return exec(`git checkout master && git merge --no-ff --no-edit ${branch}`);
}

// Bump version using NPM (only affects package*.json, doesn't commit).
function bumpVersion(newversion) {
  console.log('Bumping version number.');
  return exec(`npm --no-git-tag-version version ${newversion}`);
}

// Build, commit, and tag the release branch with its release version.
async function buildCommitTag(tagmessage) {
  console.log('Running build process in release branch.');
  await exec(`git checkout ${getReleaseBranch()} && npm run build`);

  const version = getVersion();
  const fullTagMessage = tagmessage ? `${version} ${tagmessage}` : version;

  console.log('Adding all changes and performing final commit.');
  await exec(`git add -A && git commit --allow-empty -m "Build ${version}"`);

  console.log('Tagging with provided tag message.');
  return exec(`git tag -a ${version} -m "${fullTagMessage}"`);
}

/* ----- TASKS ----- */

// Stage a release (bump version and create a 'release/[version]' branch).
async function stageRelease(newversion) {
  await bumpVersion(newversion || 'patch');

  console.log('Creating release branch and committing changes.');
  return exec(`git checkout -b ${getReleaseBranch()} && git add -A && git commit -m "Prepare release ${getVersion()}"`);
}

// Tag and merge the latest release into master.
async function release(tagmessage) {
  await buildCommitTag(tagmessage || '');
  await mergeBranch(getReleaseBranch());

  // console.log('Deleting release branch.');
  // return exec(`git branch -d ${getReleaseBranch()}`);
}

function publishGH() {
  return exec(`git push --follow-tags origin master ${getReleaseBranch()}`);
}
