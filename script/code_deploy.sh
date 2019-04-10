#!/bin/bash
set -x
set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

rm -rf .git
git init
git config user.name "CanopyJS"
git config user.email "canopyjs@gmail.com"
git remote add upstream "https://$GH_TOKEN@github.com/canopy-js/canopy-js.git"
git fetch upstream
git reset upstream/build
npm run build
git add -A
git commit -m "Code built at ${rev}"
git push -f -q upstream HEAD:build
