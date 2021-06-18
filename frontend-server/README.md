# Frontend Server
Express server for static files.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Available scripts](#available-scripts)
- [Built With](#built-with)

## Getting Started
This package is intended to be installed and used by other projects.

### Prerequisites
Before you start:
- install [NodeJS](https://nodejs.org/) _(12.18.4 or newer)_

If you already have NodeJS, make sure to upgrade `npm` to _(12.18.4 or newer)_:
 `npm install -g npm`

### Installation
Run:
- `npm install --save git+ssh://git@bitbucket.esmiley.dk:7999/esr/frontend-server.git`

### Usage
Add the following script to your `package.json`:
```
"start": "PORT=3000 fe-server-start"
```
and then run `npm run start`.

If you instead wish to run it from the terminal:
- `node node_modules/.bin/fe-server-start`

### Available scripts
- `fe-server-start`
(start the express server with /ping, /status, /health-check and serve the static files in the dist/ folder)
- `fe-server-bundle`
(bundle the static files and the server to artifact.tgz, useful to make a shareable artifact in a build plan)
- `build-and-push` - from _feathers-commons-esmiley_
(build the docker image and push to the registry)
- `upgrade-and-migrate` - from _feathers-commons-esmiley_
(tell rancher to deploy and upgrade the service)
  
## Built With
- [Express](https://expressjs.com)
