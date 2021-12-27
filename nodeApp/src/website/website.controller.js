const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const websiteService = require('./website.service');

// routes
router.get('/',  getSettings );
router.post('/update-settings',  authorize(Role.Admin), updateSettings );


module.exports = router;

function getSettings(req, res, next) {
    websiteService.getSettings()
        .then(websites => res.json(websites))
        .catch(next);
}

function updateSettings(req, res, next) {
    // users can update their own discount and admins can update any discount
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    websiteService.updateSettings(req.body)
        .then(website => res.json(website))
        .catch(next);
}