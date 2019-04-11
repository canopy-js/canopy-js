#!/bin/bash
set -x
set -o errexit -o nounset

rev=$(git rev-parse --short HEAD)

cd docs/build

git init
git config user.name "CanopyJS"
git config user.email "canopyjs@gmail.com"

git remote add upstream "https://$GH_TOKEN@github.com/canopy-js/canopy-js.github.io.git"
git fetch upstream
git reset upstream/master # Or github-pages

touch .nojekyll
touch .

git add -A .
git commit -m "rebuild pages at ${rev}"
git push -q upstream HEAD:master # Or github-pages
