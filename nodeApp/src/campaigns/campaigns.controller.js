const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const campaignService = require('./campaign.service');

// routes
router.post('/',  getAll, getAllSchema );
router.get('/:where/:whereClause',  getWhere);
router.get('/:id', authorize(), getById);
router.post('/create', authorize(Role.Admin), create);
router.post('/bulk-create', authorize(Role.Admin), bulkCreate);
router.post('/bulk-delete', authorize(Role.Admin), bulkDelete);
router.post('/get-admin-qrcodes', authorize(Role.Admin), getAdminQrCodes);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function getAll(req, res, next) {
    campaignService.getAll(req.body)
        .then(campaigns => res.json(campaigns))
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
        campaignService.getWhere(req.params.whereClause)
        .then(campaigns => res.json(campaigns))
        .catch(next);
    }
    else {
        throw "only where clause supported";
    }
}

function getById(req, res, next) {
    campaignService.getById(req.params.id)
        .then(campaign => campaign ? res.json(campaign) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        totalCoupons: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    campaignService.create(req.body)
        .then(campaign => res.json(campaign))
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
    // users can update their own campaign and admins can update any campaign
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    campaignService.update(req.params.id, req.body)
        .then(campaign => res.json(campaign))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own campaign and admins can delete any campaign
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    campaignService.delete(req.params.id)
        .then(() => res.json({ message: 'campaign deleted successfully' }))
        .catch(next);
}

function bulkCreate(req, res, next) {
    campaignService.bulkCreate(req.body)
        .then(campaign => res.json(campaign))
        .catch(next);
}

function bulkDelete(req, res, next) {
    campaignService.bulkDelete(req.body)
        .then(campaign => res.json({message:"campaign deleted successfully"}))
        .catch(next);
}

function getAdminQrCodes(req, res, next) {
    campaignService.getAdminQrCodes(req.body.campaignId)
        .then(codes => res.json(codes))
        .catch(next);
}