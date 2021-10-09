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
    
    const pictures = await db.Picture.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const pictures = await db.Picture.findAll();
    return pictures; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const picture = await db.Picture.findAll({
        where: obj
      });
    if (!picture) throw 'Picture not found';
    return picture;
}

async function getById(id) {
    const picture = await getPicture(id);
    return basicDetails(picture);
}

async function create(params) {
    // validate
    if (await db.Picture.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const picture = new db.Picture(params);
    picture.verified = Date.now();

    // hash password
    picture.passwordHash = await hash(params.password);

    // save picture
    await picture.save();

    return basicDetails(picture);
}

async function update(id, params) {
    const picture = await getPicture(id);

    // validate (if email was changed)
    if (params.email && picture.email !== params.email && await db.Picture.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to picture and save
    Object.assign(picture, params);
    picture.updated = Date.now();
    await picture.save();

    return basicDetails(picture);
}

async function _delete(id) {
    const picture = await getPicture(id);
    await picture.destroy();
}

// helper functions

async function getPicture(id) {
    const picture = await db.Picture.findByPk(id);
    if (!picture) throw 'Picture not found';
    return picture;
}