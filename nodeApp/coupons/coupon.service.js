const config = require('./../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('./../_helpers/send-email');
const db = require('./../_helpers/db');
const Role = require('./../_helpers/role');
const { json } = require('body-parser');
const  replaceOperators  = require('./../_helpers/map-where');

module.exports = {
    getAll,
    getWhere,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll(params) {
    let whereFilter = undefined;
    if(params.where){
        let objectFilter = JSON.parse(JSON.stringify(params.where));
        whereFilter = replaceOperators(objectFilter);
    }
    
console.log(whereFilter);

    const coupons = await db.Coupon.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const coupons = await db.Coupon.findAll();
    return coupons; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const coupon = await db.Coupon.findAll({
        where: obj
      });
    if (!coupon) throw 'Coupon not found';
    return coupon;
}

async function getById(id) {
    const coupon = await getCoupon(id);
    return basicDetails(coupon);
}

async function create(params) {
    // validate
    if (await db.Coupon.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const coupon = new db.Coupon(params);
    coupon.verified = Date.now();

    // hash password
    coupon.passwordHash = await hash(params.password);

    // save coupon
    await coupon.save();

    return basicDetails(coupon);
}

async function update(id, params) {
    const coupon = await getCoupon(id);

    // validate (if email was changed)
    if (params.email && coupon.email !== params.email && await db.Coupon.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to coupon and save
    Object.assign(coupon, params);
    coupon.updated = Date.now();
    await coupon.save();

    return basicDetails(coupon);
}

async function _delete(id) {
    const coupon = await getCoupon(id);
    await coupon.destroy();
}

// helper functions

async function getCoupon(id) {
    const coupon = await db.Coupon.findByPk(id);
    if (!coupon) throw 'Coupon not found';
    return coupon;
}