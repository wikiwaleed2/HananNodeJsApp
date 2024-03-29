﻿const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../_middleware/validate-request');
const authorize = require('./../_middleware/authorize')
const Role = require('./../_helpers/role');
const couponService = require('./coupon.service');

// routes
router.post('/',  getAll, getAllSchema );
router.post('/buy-coupons', authorize(), buyCoupons);
router.post('/create-payment-intent', authorize(), createPaymentIntent);
router.post('/update-payment-intent', authorize(), updatePaymentIntent);
router.post('/confirm-payment-intent', authorize(), confirmPaymentIntent);
router.post('/create-charge', authorize(), createCharge);
router.post('/create-source', authorize(), createSource);
router.post('/buy-with-gpay', buyWithGpay);


router.get('/:id', authorize(), getById);
router.post('/create', authorize(Role.Admin), create);
router.post('/bulk-create', authorize(Role.Admin), bulkCreate);
router.post('/bulk-delete', authorize(Role.Admin), bulkDelete);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function getAll(req, res, next) {
    couponService.getAll(req.body)
        .then(coupons => res.json(coupons))
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
        couponService.getWhere(req.params.whereClause)
        .then(coupons => res.json(coupons))
        .catch(next);
    }
    else {
        throw "only where clause supported";
    }
}

function getById(req, res, next) {
    // users can get their own coupon and admins can get any coupon
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    couponService.getById(req.params.id)
        .then(coupon => coupon ? res.json(coupon) : res.sendStatus(404))
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
    couponService.create(req.body)
        .then(coupon => res.json(coupon))
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
    // users can update their own coupon and admins can update any coupon
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    couponService.update(req.params.id, req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own coupon and admins can delete any coupon
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    couponService.delete(req.params.id)
        .then(() => res.json({ message: 'coupon deleted successfully' }))
        .catch(next);
}

function bulkCreate(req, res, next) {
    couponService.bulkCreate(req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function bulkDelete(req, res, next) {
    couponService.bulkDelete(req.body)
        .then(coupon => res.json({message:"coupon deleted successfully"}))
        .catch(next);
}


function buyCoupons(req, res, next) {
    // users can get their own qrCode and admins can get any qrCode
    if (Number(req.user.id) !== req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    couponService.buyCoupons(req)
        .then(qrCode => qrCode ? res.json(qrCode) : res.sendStatus(404))
        .catch(next);
}


function createPaymentIntent(req, res, next) {
    couponService.createPaymentIntent(req.body)
        .then(pi => pi ? res.json(pi) : res.sendStatus(404))
        .catch(next);
}

function updatePaymentIntent(req, res, next) {
    couponService.updatePaymentIntent(req.body)
        .then(pi => pi ? res.json(pi) : res.sendStatus(404))
        .catch(next);
}

function confirmPaymentIntent(req, res, next) {
    couponService.confirmPaymentIntent(req.body)
        .then(pi => pi ? res.json(pi) : res.sendStatus(404))
        .catch(next);
}

function createCharge(req, res, next) {
    couponService.createCharge(req.body)
        .then(ch => ch ? res.json(ch) : res.sendStatus(404))
        .catch(next);
}

function createSource(req, res, next) {
    couponService.createSource(req.body)
        .then(ch => ch ? res.json(ch) : res.sendStatus(404))
        .catch(next);
}

function buyWithGpay(req, res, next) {
    couponService.buyWithGpay(req.body)
        .then(ch => ch ? res.json(ch) : res.sendStatus(404))
        .catch(next);
}