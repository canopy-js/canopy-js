#!/bin/bash
set -x
set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

git remote add upstream "https://$GH_TOKEN@github.com/canopy-js/canopy-js.git"
git config remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
git fetch --unshallow --tags
git fetch upstream

git remote -v
git branch -r

git reset upstream/build
git stash
git checkout upstream/build
git stash apply
npm run build-prod
git add -A
git commit -m "Code built at ${rev}"
git push -q upstream HEAD:build
