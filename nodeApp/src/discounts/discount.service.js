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
    delete: _delete,
    bulkCreate,
    bulkDelete
};

async function getAll(params) {
    let whereFilter = undefined;
    if(params.where){
        let objectFilter = JSON.parse(JSON.stringify(params.where));
        whereFilter = replaceOperators(objectFilter);
    }

    const discounts = await db.Discount.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const discounts = await db.Discount.findAll();
    return discounts; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const discount = await db.Discount.findAll({
        where: obj
      });
    if (!discount) throw 'Discount not found';
    return discount;
}

async function getById(id) {
    const discount = await getDiscount(id);
    return discount;
}

async function create(params) {
    const discount = new db.Discount(params);

    // save discount
    await discount.save();

    return discount;
}

async function update(id, params) {
    const discount = await getDiscount(id);

    // copy params to discount and save
    Object.assign(discount, params);
    discount.updated = Date.now();
    await discount.save();

    return discount;
}

async function _delete(id) {
    const discount = await getDiscount(id);
    await discount.destroy();
}

// helper functions

async function getDiscount(id) {
    const discount = await db.Discount.findByPk(id);
    if (!discount) throw 'Discount not found';
    return discount;
}

async function bulkCreate(params) {
    const discounts = await db.Discount.bulkCreate(params, {returning:true} );
    return discounts;
}

async function bulkDelete(params) {
    await db.Discount.destroy({ where: {id : params} });
}