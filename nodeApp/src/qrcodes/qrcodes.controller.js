const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const qrCodeService = require('./qrCode.service');

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
    qrCodeService.getAll(req.body)
        .then(qrCodes => res.json(qrCodes))
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
        qrCodeService.getWhere(req.params.whereClause)
        .then(qrCodes => res.json(qrCodes))
        .catch(next);
    }
    else {
        throw "only where clause supported";
    }
}

function getById(req, res, next) {
    // users can get their own qrCode and admins can get any qrCode
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    qrCodeService.getById(req.params.id)
        .then(qrCode => qrCode ? res.json(qrCode) : res.sendStatus(404))
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
    qrCodeService.create(req.body)
        .then(qrCode => res.json(qrCode))
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
    // users can update their own qrCode and admins can update any qrCode
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    qrCodeService.update(req.params.id, req.body)
        .then(qrCode => res.json(qrCode))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own qrCode and admins can delete any qrCode
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    qrCodeService.delete(req.params.id)
        .then(() => res.json({ message: 'qrCode deleted successfully' }))
        .catch(next);
}

function bulkCreate(req, res, next) {
    qrCodeService.bulkCreate(req.body)
        .then(qrCode => res.json(qrCode))
        .catch(next);
}

function bulkDelete(req, res, next) {
    qrCodeService.bulkDelete(req.body)
        .then(qrCode => res.json({message:"qrCode deleted successfully"}))
        .catch(next);
}
