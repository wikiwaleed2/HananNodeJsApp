const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const popupService = require('./popup.service');

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
    popupService.getAll(req.body)
        .then(popups => res.json(popups))
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
        popupService.getWhere(req.params.whereClause)
        .then(popups => res.json(popups))
        .catch(next);
    }
    else {
        throw "only where clause supported";
    }
}

function getById(req, res, next) {
    // users can get their own popup and admins can get any popup
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    popupService.getById(req.params.id)
        .then(popup => popup ? res.json(popup) : res.sendStatus(404))
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
    popupService.create(req.body)
        .then(popup => res.json(popup))
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
    // users can update their own popup and admins can update any popup
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    popupService.update(req.params.id, req.body)
        .then(popup => res.json(popup))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own popup and admins can delete any popup
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    popupService.delete(req.params.id)
        .then(() => res.json({ message: 'popup deleted successfully' }))
        .catch(next);
}

function bulkCreate(req, res, next) {
    popupService.bulkCreate(req.body)
        .then(popup => res.json(popup))
        .catch(next);
}

function bulkDelete(req, res, next) {
    popupService.bulkDelete(req.body)
        .then(popup => res.json({message:"popup deleted successfully"}))
        .catch(next);
}
