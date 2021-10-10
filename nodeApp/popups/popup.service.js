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
    
    const Popups = await db.Popup.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const Popups = await db.Popup.findAll();
    return Popups; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const Popup = await db.Popup.findAll({
        where: obj
      });
    if (!Popup) throw 'Popup not found';
    return Popup;
}

async function getById(id) {
    const Popup = await getPopup(id);
    return basicDetails(Popup);
}

async function create(params) {
    // validate
    if (await db.Popup.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const Popup = new db.Popup(params);
    Popup.verified = Date.now();

    // hash password
    Popup.passwordHash = await hash(params.password);

    // save Popup
    await Popup.save();

    return basicDetails(Popup);
}

async function update(id, params) {
    const Popup = await getPopup(id);

    // validate (if email was changed)
    if (params.email && Popup.email !== params.email && await db.Popup.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to Popup and save
    Object.assign(Popup, params);
    Popup.updated = Date.now();
    await Popup.save();

    return basicDetails(Popup);
}

async function _delete(id) {
    const Popup = await getPopup(id);
    await Popup.destroy();
}

// helper functions

async function getPopup(id) {
    const Popup = await db.Popup.findByPk(id);
    if (!Popup) throw 'Popup not found';
    return Popup;
}