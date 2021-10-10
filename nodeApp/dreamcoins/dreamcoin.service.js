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

    const dreamCoins = await db.DreamCoin.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const dreamCoins = await db.DreamCoin.findAll();
    return dreamCoins; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const dreamCoin = await db.DreamCoin.findAll({
        where: obj
      });
    if (!dreamCoin) throw 'DreamCoin not found';
    return dreamCoin;
}

async function getById(id) {
    const dreamCoin = await getDreamCoin(id);
    return basicDetails(dreamCoin);
}

async function create(params) {
    // validate
    if (await db.DreamCoin.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const dreamCoin = new db.DreamCoin(params);
    dreamCoin.verified = Date.now();

    // hash password
    dreamCoin.passwordHash = await hash(params.password);

    // save dreamCoin
    await dreamCoin.save();

    return basicDetails(dreamCoin);
}

async function update(id, params) {
    const dreamCoin = await getDreamCoin(id);

    // validate (if email was changed)
    if (params.email && dreamCoin.email !== params.email && await db.DreamCoin.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to dreamCoin and save
    Object.assign(dreamCoin, params);
    dreamCoin.updated = Date.now();
    await dreamCoin.save();

    return basicDetails(dreamCoin);
}

async function _delete(id) {
    const dreamCoin = await getDreamCoin(id);
    await dreamCoin.destroy();
}

// helper functions

async function getDreamCoin(id) {
    const dreamCoin = await db.DreamCoin.findByPk(id);
    if (!dreamCoin) throw 'DreamCoin not found';
    return dreamCoin;
}