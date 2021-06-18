# FoodWaste

## About
This service has the aim to accept the incoming registration requests for FoodWaste control, from our website and 
requests for changes in the metadata of the FoodWaste registrations of users and return the current ones.

## Getting Started

1. Make sure you have installed:
    * [Node.js & npm](https://confluence.esmiley.dk/display/TECH/Node.js+setup+%28and+frameworks%29+-+NVM)
    * [Docker](https://confluence.esmiley.dk/display/TECH/Docker)
    * [Postgres 9.6](https://confluence.esmiley.dk/display/TECH/PostgreSQL) (for the terminal client - server will run in its own container, don't forget to test that the `psql` command works)

2. Create a Docker network for microservices or make sure you have one already:

    The services are placed in a separate Docker network named `ms-network`. Check whether you already have it:

    ```bash
    docker network inspect ms-network
    ```

    If it doesn't exist, create it:

    ```bash
    docker network create ms-network
    ```

3. Install dependencies and setup the service. Make sure you're in the root dir, but not in `/app` - then run the install script
    ```bash
    ./install.sh
    ```
If this service is freshly created from the Scaffold, then this script will prompt you will several questions, in the 
terminal, that are needed in order to setup some configuration parameters like DB name, service name and port.

4. Initialize and run the environment.
    ```bash
    cd app/
    npm run init-env
    ```
       
This command will:
* Lift all Docker containers, including the DBs behind the service
* Create the DBs, the migration and app users, the tables and will populate them with some test/dev data
* Lift the service container and the server app

##### API entry point - confirming service lift

After a successful lift the base API endpoint is at `http://localhost:7001/foodwaste/`

Test it by calling the ping-endpoint:
```bash
curl -i http://localhost:7001/foodwaste/ping
```

The teapot should respond with a JSON-`pong`.

##### Start the service application only (dev env)
The service can only be started within the container (not locally on the dev machine). This happens simply by executing
`npm start` 

*Note:* the DB containers must be running already.
    
**If you've already initialized the environment before** and if DB containers are started already, you only need to 
start the current service container. The `init-env` command can do that for you and will ignore the DB containers and 
only re-create the DB users and tables, but that's not necessary, since it has been initalized before already.
    
***Suggestion:*** look through the scrip commands in the `package.json` file and see the different options for manipulating 
the environment. This will speed up your development process.

#### Production env
In production the DBs will be running on dedicated instances for the certain DBs, so we will not be running them in Docker
containers. Therefore only the service application will be Dockerized. For that purpose execute `npm run lift-service-prod` 
on the host server.

## Testing

1. Create a file with extension `.test.js` inside the `/test/unit` or `/test/integration` folder, depending on whether it's a Unit or Integration test ([difference between Unit and Integration tests](http://stackoverflow.com/questions/5357601/whats-the-difference-between-unit-tests-and-integration-tests#5357837))
    * If it's a *Unit* test, then name it after the function that you're testing with it.
 		* Mock all outer dependencies like the input and *calls to other functions within the tested function, and also their returned results*
 		* Write tests for both success and error outcomes
    * If it's an *Integration* test, then name it after the module you're testing.
		* Mock only dependencies that you cannot control, like 3rd party functions/services.
		* Write tests for both success and error outcomes

2. The test suite is defined by a `describe()` function where the first argument is the name of the function you're testing preceded with `#` (if it is a Unit test` or just the name of the module.

3. Each testing case within the `describe` suite should be enclosed in `it()` function, where the first param is short description of what the test should do. The description should start with `should ...`.

If you want to test just one test case or suite, simply append `only` to it, like this:
```
it.only(...)
```
If you want to omit a test, *temporarily*, for some reason, append `skip` to it, like this:
```
it.skip(...)
```

## Migrations

Changes in the schemas of the relational DBs should only be done through migrations!

1. Install `sequelize-cli` module globally on your machine, so that you can create the migrations files:
```bash
npm i -g sequelize-cli 
```

2. Create a migration file (execute command in terminal):
```javascript
npm run create-migration NameOfMigration
```

or the raw command:

```javascript
sequelize migration:create --name="NameOfMigration"
```

You'll get NPM or Redis error, respectively to which command you execute, but don't worry about it. Just disregard them.


3. Implement the migration's `up` and `down` functions.
Don't be lazy and *do implement* the `down` function as well - the revert logic of the changes you want to do in the DB.
In case we need to rollback the changes - this will be the function that will be executed.

Here's [the Sequelize migrations documentation](http://docs.sequelizejs.com/en/latest/docs/migrations/) where you can 
see all CLI commands and the pre-defined migrations API methods. If there is no pre-defined method for the functionality
that you want to implement, just do it with a raw SQL query, which can be executed like this:
```javascript
return queryInterface.sequelize.query("YOUR query GOES here");
```

*NOTE:* if you create a new table in your migration, then you should also execute a query that grants CRUD permissions
to the current app user to that table, in the same migration.

#### Rollback a migration
Rolling back **should be done manually, within the host running the service**. So, if it's on dev env, you will have to 
SSH into the Docker container running the service.
If it's in `production`, etc., you will have to SSH to that host, and then SSH into the Docker container running the service.

Then, rolling back migration(s) can be done manually, by executing a script:
```bash
npm run rollback
```
This npm command executes a script that runs `umzug` in the background. Executed like shown above, it will rollback only 
last migration. You can also rollback multiple migrations by providing the name of the migration *to which (including) 
you wish to rollback to*:
```bash
npm run rollback name_of_migration
```
*Without quotes!!!*

## TSLint
[TSLint](https://www.npmjs.com/package/tslint) is a tool that takes care of checking that the code formatting is intact according to predefined rules.

The specific rules that we follow are defined in the [commons-config-node](https://bitbucket.esmiley.dk/projects/ESR/repos/commons-config-node/browse/bin/tslint.json)
module (or can be seen locally at `app/node_modules/.bin/tslint.json` since the module is installed as dependency). Nevertheless, these are only a handful of rules, 
that overwrite some rules from the [recommended list of rules](https://github.com/palantir/tslint/blob/master/src/configs/recommended.ts).
Therefore, our code follows all rules defined in the full list, where we overwrite some of them, according to our
preferences.

Explanation of all rules can be seen [here](https://palantir.github.io/tslint/rules/).

Additionally, we integrate a plug for [ESLint rules for TSLint](https://github.com/buzinas/tslint-eslint-rules), since 
TSLint is not as extensive as ESLint and does not cover all code formatting rules that we would like to make use of.


#### Omit specific rules in a specific file
Can be done by adding a comment at the beginning of the file. Take a look at the [Rule Flags](https://www.npmjs.com/package/tslint#rule-flags).

#### Commands
In order to *only lint* the source files, you can run `gulp tslint`.
Nevertheless, you must always make sure the TS files are correctly compiled before you lint. Thus, *as a rule of thumb*, 
run the `npm run make` command, that will both transpile and lint. Then you can run the tests freely. :) 

When the linter finds errors, they will be shown in the console, and need to be fixed accordingly, in order for the 
tests to be ran and passed.

## FeathersJS Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g feathers-cli             # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```
Generating a service, hook or model will automatically create the test files for the specific module.
