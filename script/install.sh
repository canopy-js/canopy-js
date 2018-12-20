#!/bin/sh

set -ex
npm install
rm -rf /usr/local/lib/canopy
cp -R . /usr/local/lib/canopy
cp script/canopy.sh /usr/local/bin/canopy
chmod +x /usr/local/bin/canopy
