const { spawnSync } = require('child_process');
const { suites } = require('../../integration/suites');
const path = require('path');
const fs = require('fs');

const browsers = [
  {
    os: 'Windows',
    os_version: '7',
    browser: 'Chrome',
    browser_version: '52.0'
  },
  {
    os: 'Windows',
    os_version: '10',
    browser: 'Edge',
    ensureCleanSession: true,
    browser_version: '15.0'
  },
  {
    os: 'Windows',
    os_version: '7',
    browser: 'Firefox',
    browser_version: '55.0',
    browserName: 'ff_55'
  },
  {
    os: 'Windows',
    os_version: '10',
    browser: 'IE',
    browser_version: '11.0',
    ensureCleanSession: true,
    browserName: 'IE11'
  },
  {
    os: 'OS X',
    os_version: 'El Capitan',
    browser: 'Safari',
    browser_version: '9.1'
  }
];

const resolutions = ['1024x768', '1920x1080'];

var buildName = 'local';

if (process.env.hasOwnProperty('BUILD_KEY')) {
  buildName = process.env['BUILD_KEY'];
} else {
  const spawn = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const now = new Date();
  buildName = '"' + spawn.stdout.toString() + '" :: ' + now.toISOString();
}

const stdCapability = {
  project: process.env.hasOwnProperty('PROJECT') ? process.env['PROJECT'] : 'frontend-client',
  build: buildName
};

var capabilities = [];

const findFilesInDir = (startPath, filter) => {
  let results = [];
  let files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    let filename = path.join(startPath, files[i]);
    let stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      results = results.concat(findFilesInDir(filename, filter)); //recurse
    } else if (filename.indexOf(filter) >= 0) {
      results.push(filename);
    }
  }

  return results;
};

var specs = findFilesInDir('./test/integration', '.test.js');

browsers.forEach((browser) => {
  resolutions.forEach((resolution) => {
    specs.forEach(function (spec) {
      capabilities.push(
        Object.assign({}, stdCapability, browser, {
          name: spec.replace('test/integration/', ''),
          resolution: resolution,
          specs: [spec]
        })
      );
    });
  });
});

exports.config = {
  capabilities: capabilities,
  suites: suites
};
