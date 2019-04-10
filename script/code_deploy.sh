#!/bin/bash
set -x
set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

git fetch origin
git reset origin/build
npm run build
git add -A
git commit -m "Code built at ${rev}"
git push -q origin HEAD:build
