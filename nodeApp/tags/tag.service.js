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

    const tags = await db.Tag.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const tags = await db.Tag.findAll();
    return tags; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const tag = await db.Tag.findAll({
        where: obj
      });
    if (!tag) throw 'Tag not found';
    return tag;
}

async function getById(id) {
    const tag = await getTag(id);
    return tag;
}

async function create(params) {
    const tag = new db.Tag(params);

    // save tag
    await tag.save();

    return tag;
}

async function update(id, params) {
    const tag = await getTag(id);

    // copy params to tag and save
    Object.assign(tag, params);
    tag.updated = Date.now();
    await tag.save();

    return tag;
}

async function _delete(id) {
    const tag = await getTag(id);
    await tag.destroy();
}

// helper functions

async function getTag(id) {
    const tag = await db.Tag.findByPk(id);
    if (!tag) throw 'Tag not found';
    return tag;
}