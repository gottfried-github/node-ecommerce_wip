import bodyParser from 'body-parser'
import {Router} from 'express'
import {makeEnsureFields, ensureFieldsCreate, ensureFieldsUpdate, handleUpdateMissingFields} from './product-helpers.js'

function product(product) {
    const router = Router()

    router.post('/create', bodyParser.json(), makeEnsureFields(ensureFieldsCreate), async (req, res, next) => {
        // console.log('/admin/product/create, body.fields:', req.body.fields)

        let doc = null
        try {
            doc = await product.create(req.body.fields)
        } catch(e) {
            return next(e)
        }

        res.status(201).json(doc)
        // res.send('/product-create: endpoint is not implemented yet')
    })

    // see '/api/admin/product:id' in notes for why I don't validate params.id
    router.post('/update/:id', bodyParser.json(), makeEnsureFields(ensureFieldsUpdate), async (req, res, next) => {
        let doc = null

        try {
            doc = await product.update(req.params.id, req.body.fields)
        } catch (e) {
            return next(e)
        }

        res.status(200).json(doc)
        // res.send('/product-update: endpoint is not implemented yet')
    }, handleUpdateMissingFields)

    router.post('/delete', (req, res) => {
        res.send('/product-delete: endpoint is not implemented yet')
    })

    // see '/api/admin/product:id' in notes for why I don't validate params.id
    router.get('/:id', async (req, res, next) => {
        // console.log('/api/admin/product/, req.query:', req.query);
        let product = null
        try {
            product = await product.getById(req.params.id)
        } catch(e) {
            return next(e)
        }

        res.status(200).json(product)
    })

    return router
}

export default product
