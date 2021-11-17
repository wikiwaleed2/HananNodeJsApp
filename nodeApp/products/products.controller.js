const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const productService = require('./product.service');

// routes
router.post('/',  getAll, getAllSchema );
router.get('/:id', authorize(), getById);
router.post('/create', authorize(Role.Admin), create);
router.post('/bulk-create', authorize(Role.Admin), bulkCreate);
router.post('/bulk-delete', authorize(Role.Admin), bulkDelete);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function getAll(req, res, next) {
    productService.getAll(req.body)
        .then(products => res.json(products))
        .catch(next);
}

function getAllSchema(req, res, next) {
    const schema = Joi.object({
        limit: Joi.number().required(),
        offset: Joi.number().required(),
        order: Joi.string().required(),
        where: Joi.any().required(),
    });
    validateRequest(req, next, schema);
}

function getWhere(req, res, next) {
    if(req.params.where === 'where'){
        productService.getWhere(req.params.whereClause)
        .then(products => res.json(products))
        .catch(next);
    }
    else {
        throw "only where clause supported";
    }
}

function getById(req, res, next) {
    // users can get their own product and admins can get any product
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    productService.getById(req.params.id)
        .then(product => product ? res.json(product) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    productService.create(req.body)
        .then(product => res.json(product))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    // users can update their own product and admins can update any product
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    productService.update(req.params.id, req.body)
        .then(product => res.json(product))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own product and admins can delete any product
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    productService.delete(req.params.id)
        .then(() => res.json({ message: 'product deleted successfully' }))
        .catch(next);
}