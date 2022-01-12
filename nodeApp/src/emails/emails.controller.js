const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const emailService = require('./email.service');

// routes
router.post('/send-email-with-attachment', senditnow);
// router.post('/send-email-with-attachment',authorize(), senditnow);
// router.post('/',  getAll, getAllSchema );
// router.get('/:id', authorize(), getById);


module.exports = router;

async function senditnow(req, res, next) {
    emailService.sendEmailWithPromiseWithDynamicData(req.body)
        .then((emailStatus) => {
            res.json(emailStatus);
        })
        .catch(next);;
}