# Description
A modular e-commerce application, implementing the specification, defined [here](#data-structure).

**Note:** this is a *sketch*, which means it doesn't even work yet - apart from the controllers in `store`, which you can [test](#test-store).

# Run
## Preparations
### Keyfile path
`data/keyfile`

### Network name
`bazar-wip` or whatever you like

### Database user password
`init.sh` will create user with name *app*. It needs us to pass it a password for this user.

## Instructions
`git clone` this repo;

From each of the subfolders - `api`, `store` and `common` - run `npm install`;

All further steps have to be done from the project's root directory

### Generate keyfile
keyfile for database (see details [here](https://docs.mongodb.com/manual/tutorial/deploy-replica-set-with-keyfile-access-control/#create-a-keyfile))

```shell
openssl rand -base64 756 > <keyfile path>
chmod 400 <keyfile path>
```

### Create the network
`docker network create <network-name>`

### Setup mongodb instance
#### Start mongo instance with a new replica set and the user admin, if not existing
creates the admin user, with the `root` role, which, among other things, contains the `userAdminAnyDatabase` role, which allows to change data (including password) of any user in any database.
`docker run --rm -v $PWD/data:/data/db -p 27017:27017 --network <network-name> --network-alias <network-alias> -e MONGO_INITDB_ROOT_USERNAME=<admin username> -e MONGO_INITDB_ROOT_PASSWORD=<admin password> mongo --replSet rs0 --keyFile /data/db/keyfile --bind_ip <network-alias> --dbpath /data/db`

#### Initialize the replica set and the app user
creates the app user with the following roles:
`readWrite`; `dbAdmin` - to be able to perform `collMod` on collections.
`./init.sh <admin password> <app password> <network name> <network alias>`

### Run node on the network
```
docker run -it --tty -v "$(pwd)":/app -w /app --network <network-name> node bash
```

### Inside the running container, run node with these environment variables
`APP_DB_NAME=app APP_DB_USER=app APP_DB_PASS=<app password> NET_NAME=<network-name> node app/index.js`

### Access the network
run `docker ps`, find container with IMAGE of "node" and copy it's ID (e.g., e28354082f09)

then `docker inspect` that container and find *NetworkSettings.Networks.mongodb-distinct.IPAddress*

this is taken from [here](https://stackoverflow.com/a/56741737)

### Apply migrations
From the node container inside `app/`:
`APP_DB_NAME=app APP_DB_USER=app APP_DB_PASS=<app password> node_modules/.bin/migrate-mongo up -f migrate-mongo-config.js`

# Api
## Function
### Inward
Api transmits the received data over to the store. In doing so, it should make sure that:
1. fields, defined [here](#data-structure) exist in the received data
2. the values are of the correct type
3. fields, not defined in the [spec](#data-structure), don't exist

### Outward
Assign status codes and messages to the output of the store and send it in response to the client.

# Store
Store needs to implement the interface, defined [here](#crud).

# App
[The app](#) bundles everything together and deploys it.

# Test store
```bash
git clone <clone url>
cd <cloned directory>/store
npm run test
```

# Data structure
## Product
### Fields
    * `isInSale`: `boolean`
    * `name`: `string`
    * `itemInitial`: `a reference to an existing item`

### Additional conditions
    1. `isInSale` must be specified
    2. if `isInSale` is `true`: the other fields must also be specified

## Item
### Fields
    * `isInSale`: `boolean`
    * `price`: `number`
    * `qty`: `integer`
    * `size`: reference to `Size`
    * `color`: `a representation of rgb`
    * `photos`: `array, containing references to Photos`

### Additional conditions
    1. `isInSale` must be specified
    2. if `isInSale` is `true`: the other fields must also be specified

# CRUD
## Validation error format
`ajv-errors-to-data-tree`-formatted tree resembling the input data, with the errors being `ValidationError`, `FieldMissing`, `TypeErrorMsg`

## create
### parameters
  1. `fields`

### behavior
* **success**: return id of created document
* **validation failure**: throw validation error

Any other error shall be treated as an internal error.

## update
### parameters
  1. `id`
  2. `fields`

### behavior
  * **success**: return `true`
  * **invalid `id` or no document with given id**: throw `InvalidCriterion`
  * **validation failure**: throw validation error

Any other error shall be treated as an internal error.

## delete
### parameters
  1. `id`

### behavior
  * **success**: return `true`
  * **invalid `id` or no document with given id**: throw `InvalidCriterion`

Any other error shall be treated as an internal error.

## getById
### parameters
  1. `id`

### behavior
  * **success**: return the found document
  * **no document found**: return `null`
  * **invalid id**: throw `InvalidCriterion`

Any other error shall be treated as an internal error.
