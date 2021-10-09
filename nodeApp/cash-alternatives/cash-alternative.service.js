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
    
    const cashAlternatives = await db.CashAlternative.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const cashAlternatives = await db.CashAlternative.findAll();
    return cashAlternatives; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const cashAlternative = await db.CashAlternative.findAll({
        where: obj
      });
    if (!cashAlternative) throw 'CashAlternative not found';
    return cashAlternative;
}

async function getById(id) {
    const cashAlternative = await getCashAlternative(id);
    return basicDetails(cashAlternative);
}

async function create(params) {
    // validate
    if (await db.CashAlternative.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const cashAlternative = new db.CashAlternative(params);
    cashAlternative.verified = Date.now();

    // hash password
    cashAlternative.passwordHash = await hash(params.password);

    // save cashAlternative
    await cashAlternative.save();

    return basicDetails(cashAlternative);
}

async function update(id, params) {
    const cashAlternative = await getCashAlternative(id);

    // validate (if email was changed)
    if (params.email && cashAlternative.email !== params.email && await db.CashAlternative.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to cashAlternative and save
    Object.assign(cashAlternative, params);
    cashAlternative.updated = Date.now();
    await cashAlternative.save();

    return basicDetails(cashAlternative);
}

async function _delete(id) {
    const cashAlternative = await getCashAlternative(id);
    await cashAlternative.destroy();
}

// helper functions

async function getCashAlternative(id) {
    const cashAlternative = await db.CashAlternative.findByPk(id);
    if (!cashAlternative) throw 'CashAlternative not found';
    return cashAlternative;
}