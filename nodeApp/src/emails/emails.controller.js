const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const emailService = require('./email.service');
let fetch = require('node-fetch');

// routes
router.post('/send-sms-message', sendSmsMEssage);
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

async function sendSmsMEssage(req, res, next) {

    const MobileNumber = '+923036838220'
    const VarificationCode =
        Math.floor(Math.random() * 90000) + 10000;
    const Message =
        VarificationCode +
        ' is your Dream Makers Verification Code';
    let a = await fetch(
        ' http://www.elitbuzz-me.com/sms/smsapi?api_key=C200346861c03c6124de61.58838181&type=text&contacts=+' +
        MobileNumber +
        '&senderid=DreamMakers&msg=' +
        Message
    );
    return res.json(a);
    fetch(
        ' http://www.elitbuzz-me.com/sms/smsapi?api_key=C200346861c03c6124de61.58838181&type=text&contacts=+' +
        MobileNumber +
        '&senderid=DreamMakers&msg=' +
        Message
    )
        .then((smsResponse) => {
            res.json(smsResponse);
        })
        .catch(next);
}