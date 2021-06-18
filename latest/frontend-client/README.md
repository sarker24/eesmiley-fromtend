# Frontend Client

---

It was originally built for the new DIY - But is now being repurposed for FoodWaste - DIY still exists on the branch `diy-before-cleanup`

Any DIY stuff uncommitted (local or PR) - should be migrated and merged to that branch.

---
<!-- 
The frontend client is a submodule of the [Frontend Server](https://bitbucket.esmiley.dk/projects/ESR/repos/frontend-server/) code.

This project is basically a hub for the client code to reside and is not intended to be run as a standalone entity, besides it's build capabilities. -->

## Getting Started

These instructions will give you instructions how to set up the build environment up for the frontend client.

### Prerequisites
##### Node
Use latest active LTS, at the time of writing the project requires node 12.18.4. Prefer nvm or 
download manually:
```
npm install node@12.18.4
```

##### Yarn

```
npm install -g yarn
```

##### Gulp 4
```
yarn add gulp -g
```

##### Install dependencies

```
yarn install
```

###### Optional: Install Jest globally

```
yarn add jest -g
```

---
### Build Instructions

#### Development Build

Build development bundles (code & assets)
``` 
yarn build:dev
```
To utilise Hot Module Reloading in the project when developing

Boot up the WebPack HMR server
```
yarn dev
```
(this will start a server at [localhost:8080](http://localhost:8080/))


#### Production Build

Build production bundles (code & assets)

```
yarn build
```

and

```
yarn start
```
(this will start the production server for the dist/ folder)

optionally you can spin up the production server locally with
```
yarn start:local
```
## Running the tests

The tests are written in both Jest and Jasmine (WDIO) you can read more about the test frameworks [in the documentation](https://confluence.esmiley.dk/display/TECH/FE+Tests)

### Unit tests

The unit tests, are written to test the minor and individual functionality of the different core elements, the components, as well as the store of the application.
Some tests require Intl api support, for which we use [full-icu](https://www.basefactor.com/javascript-es6-intl-not-working-properly-when-running-jest-tests), 
therefore make sure to add the following env variable in your IDE if needed: 
```
NODE_ICU_DATA=node_modules/full-icu.
```
```
npm run test
```
You can potentially if you have `jest` installed as a global package also run:
```
jest --coverage
```
To get full coverage reporting

### Integration Tests (WIP)

The integration tests, are written to test the interactivity between components. 
In order to run the tests, the frontend server must be running.

```
npm run test-integration
```

## Automated Documentation

The system has automatic documentation generation so that it's easier to find information about core aspects of the application.
Such as the global components and their code, or the core files API.

To run the automated documentation generation run:

```
npm run build-docs
```

## Deployment
Run:
- `yarn build` (build the static files)
- `yarn bundle` (bundle the static files and the server to artifact.tgz)
- `yarn build-and-push` (build the docker image and push to the registry)
- `yarn upgrade-and-migrate` (tell rancher to deploy and upgrade the service)

## Built With
- [React](https://facebook.github.io/react/)
- [Redux](https://redux.js.org/) (State Container)
- [Typescript](https://www.typescriptlang.org/)


## Versioning

We'll use [SemVer](http://semver.org/) for versioning.
