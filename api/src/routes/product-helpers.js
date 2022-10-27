import {productStripFields} from '../../../common/helpers.js'
import * as m from '../../../common/messages.js'

function ensureFields(body) {
    const fields = productStripFields(body)

    const errors = {}
    if ('isInSale' in fields && 'boolean' !== typeof fields.isInSale) errors.isInSale = [new TypeError("'isInSale' must be boolean")]
    if ('name' in fields && 'string' !== typeof fields.name) errors.name = [new TypeError("'name' must be a string")]
    if ('itemInitial' in fields && 'string' !== typeof fields.itemInitial) errors.itemInitial = [new TypeError("'name' must be a string")]

    if (Object.keys(errors).length) return {fields: null, errors}
    return {fields}
}

function ensureFieldsCreate(body) {
    if (!('isInSale' in body)) return {fields: null, errors: {isInSale: [m.FieldMissing.create("'isInSale' must be specified")]}}
    return ensureFields(body)
}

function ensureFieldsUpdate(body) {
    const fields = productStripFields(body)
    if (!Object.keys(fields).length) return {fields: null, errors: [m.FieldMissing.create("at least one of the fields must be specified")]}

    return ensureFields(body)
}

function handleUpdateMissingFields(e, req, res, next) {
    if (!e) return next()
    if (!('code' in e) || m.FieldMissing.code !== e.code) return next(e)
    res.status(400).json(e)
}

function makeEnsureFields(ensureFields) {
    return (req, res, next) => {
        const _res = ensureFields(req.body)
        console.log("makeEnsureFields-produced method, ensureFields _res:", _res)

        if (!_res.fields) {
            if (!_res.errors) return next(new Error("ensureFieldsCreate must return either fields or errors"))
            return next(convertToAEDT(_res.errors))
        }

        req.body.fields = _res.fields
        next()
    }
}

function convertToAEDT(errors) {
    const root = {node: {}}

    const keys = Object.keys(errors)
    console.log("convertToAEDT", keys);
    for (const k of keys) {
        root.node[k] = {errors: errors[k]}
    }

    return root
}

export {
    ensureFields,
    ensureFieldsCreate,
    ensureFieldsUpdate,
    handleUpdateMissingFields,
    makeEnsureFields,
}