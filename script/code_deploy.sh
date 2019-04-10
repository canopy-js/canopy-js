#!/bin/bash
set -x
set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

# cd dist
# git init
# git config user.name "CanopyJS"
# git config user.email "canopyjs@gmail.com"

git remote add upstream "https://$GH_TOKEN@github.com/canopy-js/canopy-js.git"
git fetch upstream
git reset --hard
git checkout build
git cherry-pick ${rev}
npm run build

git add -f dist
git commit -m "Code built at ${rev}"
git push -q upstream HEAD:build
