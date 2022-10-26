import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express'
import {MongoClient} from 'mongodb'

import {api as _api} from '../api/src/index.js'
import _store from '../store/src/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function main(port) {
    /* connect to database */
    if (!process.env.APP_DB_NAME || !process.env.APP_DB_USER || !process.env.APP_DB_PASS || !process.env.NET_NAME) throw new Error('all of the database connection parameters environment variables must be set')

    const client = new MongoClient(`mongodb://${process.env.APP_DB_USER}:${process.env.APP_DB_PASS}@${process.env.NET_NAME}/${process.env.APP_DB_NAME}`)
    client.connect()

    /* initialize store and api */
    const store = _store(client.db(process.env.APP_DB_NAME), client)
    const api = _api(store)

    const app = express()
    app.use('/', express.static(path.join(__dirname, './dist/front-end')))
    app.use('/api/', api)

    /* start server */
    const server = app.listen(3000)

    return {app, server, api, store}
}

console.log(main(3000))
console.log(import.meta.url)