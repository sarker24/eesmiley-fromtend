#!/bin/bash

ENV=$1

cd app/
rm -rf node_modules/

if [ "$ENV" != 'production' ]; then
    # Replace all occurrences of ".git#v..." with ".git#develop"
    # So, basically, point to "develop" branch instead of tag version for our in-house modules if in develop env
    cat package.json | sed -E 's/\.git#v[^"]+/\.git#develop/g' > package.temp

    # Saving the modifications from `sed` directly to the file doesn't work for some reason. That's why use a temporary
    # transitioning file to store the modified `package.json` data.
    rm package.json
    cat package.temp > package.json
    rm package.temp
fi

# Install the modules, however they are pointed at in `package.json`
npm i
ln -sf node_modules/.bin/tsconfig.json tsconfig.json
ln -sf node_modules/.bin/tslint.json tslint.json
# Checkout the file so that, if modified earlier because in `develop` env, it is put back to normal
git checkout package.json

node node_modules/.bin/prep-service
