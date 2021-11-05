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

    const charitypartners = await db.CharityPartner.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const charitypartners = await db.CharityPartner.findAll();
    return charitypartners; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const charitypartner = await db.CharityPartner.findAll({
        where: obj
      });
    if (!charitypartner) throw 'CharityPartner not found';
    return charitypartner;
}

async function getById(id) {
    const charitypartner = await getCharityPartner(id);
    return charitypartner;
}

async function create(params) {
    const charitypartner = new db.CharityPartner(params);
    
    // save charitypartner
    await charitypartner.save();

    return charitypartner;
}

async function update(id, params) {
    const charitypartner = await getCharityPartner(id);

    // copy params to charitypartner and save
    Object.assign(charitypartner, params);
    charitypartner.updated = Date.now();
    await charitypartner.save();

    return charitypartner;
}

async function _delete(id) {
    const charitypartner = await getCharityPartner(id);
    await charitypartner.destroy();
}

// helper functions

async function getCharityPartner(id) {
    const charitypartner = await db.CharityPartner.findByPk(id);
    if (!charitypartner) throw 'CharityPartner not found';
    return charitypartner;
}