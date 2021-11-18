const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const tagService = require('./tag.service');

// routes
router.post('/',  getAll, getAllSchema );
router.get('/:id', authorize(), getById);
router.post('/create', authorize(Role.Admin), create);
router.post('/bulk-create', authorize(Role.Admin), bulkCreate);
router.post('/bulk-delete', authorize(Role.Admin), bulkDelete);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);
router.post('/create-campaign-tag', authorize(Role.Admin), createCampaignTag);
router.post('/delete-campaign-tag/:id', authorize(Role.Admin), deleteCampaignTag);
router.post('/bulk-create-campaign-tag', authorize(Role.Admin), bulkCreateCampaignTag);
router.post('/bulk-delete-campaign-tag', authorize(Role.Admin), bulkDeleteCampaignTag);
router.post('/create-recommendation-tag', authorize(Role.Admin), createRecommendationTag);
router.post('/delete-recommendation-tag/:id', authorize(Role.Admin), deleteRecommendationTag);
router.post('/bulk-create-recommendation-tag', authorize(Role.Admin), bulkCreateRecommendationTag);
router.post('/bulk-delete-recommendation-tag', authorize(Role.Admin), bulkDeleteRecommendationTag);
module.exports = router;

function getAll(req, res, next) {
    tagService.getAll(req.body)
        .then(tags => res.json(tags))
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
        tagService.getWhere(req.params.whereClause)
        .then(tags => res.json(tags))
        .catch(next);
    }
    else {
        throw "only where clause supported";
    }
}

function getById(req, res, next) {
    // users can get their own tag and admins can get any tag
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    tagService.getById(req.params.id)
        .then(tag => tag ? res.json(tag) : res.sendStatus(404))
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
    tagService.create(req.body)
        .then(tag => res.json(tag))
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
    // users can update their own tag and admins can update any tag
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    tagService.update(req.params.id, req.body)
        .then(tag => res.json(tag))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own tag and admins can delete any tag
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    tagService.delete(req.params.id)
        .then(() => res.json({ message: 'tag deleted successfully' }))
        .catch(next);
}

function bulkCreate(req, res, next) {
    tagService.bulkCreate(req.body)
        .then(tag => res.json(tag))
        .catch(next);
}

function bulkDelete(req, res, next) {
    tagService.bulkDelete(req.body)
        .then(tag => res.json({message:"tag deleted successfully"}))
        .catch(next);
}


///---------------Campaign Tags-------------------------////// 
function createCampaignTag(req, res, next) {
    tagService.createCampaignTag(req.body)
        .then(campaignTag => res.json(campaignTag))
        .catch(next);
}

function deleteCampaignTag(req, res, next) {
    tagService.deleteCampaignTag(req.params.id)
        .then(() => res.json({ message: 'campaign tag deleted successfully' }))
        .catch(next);
}

function bulkCreateCampaignTag(req, res, next) {
    tagService.bulkCreateCampaignTag(req.body)
        .then(campaignTags => res.json(campaignTags))
        .catch(next);
}

function bulkDeleteCampaignTag(req, res, next) {
    tagService.bulkDeleteCampaignTag(req.body)
        .then(campaignTags => res.json({message:"campaign tags deleted successfully"}))
        .catch(next);
}

///---------------Recommendation Tags-------------------------////// 
function createRecommendationTag(req, res, next) {
    tagService.createRecommendationTag(req.body)
        .then(campaignTag => res.json(campaignTag))
        .catch(next);
}

function deleteRecommendationTag(req, res, next) {
    tagService.deleteRecommendationTag(req.params.id)
        .then(() => res.json({ message: 'recommendation tag deleted successfully' }))
        .catch(next);
}

function bulkCreateRecommendationTag(req, res, next) {
    tagService.bulkCreateRecommendationTag(req.body)
        .then(campaignTags => res.json(campaignTags))
        .catch(next);
}

function bulkDeleteRecommendationTag(req, res, next) {
    tagService.bulkDeleteRecommendationTag(req.body)
        .then(campaignTags => res.json({message:"recommendation tags deleted successfully"}))
        .catch(next);
}
