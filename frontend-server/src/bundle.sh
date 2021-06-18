#!/bin/bash

echo "===== Bundling the static app and the server"

echo "---------------------------"
echo "** Copy dist/ and package.json to app/ **"
echo "** (TODO: get rid of git??) **"
echo "---------------------------"
mkdir app/
cp -r yarn.lock package.json dist/ .git/ app/

echo "---------------------------"
echo "** Install production dependencies (the server) **"
echo "---------------------------"
cd app/
yarn install --production
cd ..

echo "---------------------------"
echo "** Generate Dockerfile **"
echo "---------------------------"
cat <<EOF > Dockerfile
FROM node:12.18.4
EOF

echo "---------------------------"
echo "** Creating the artifact **"
echo "---------------------------"
# tar -czp --ignore-failed-read -f artifact.tgz dist node_modules/ package.json
tar -czpf artifact.tgz app/ Dockerfile

echo "---------------------------"
echo "** Cleanup **"
echo "---------------------------"
rm -rf app/ Dockerfile
