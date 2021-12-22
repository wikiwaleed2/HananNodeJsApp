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

    if(params?.where?.AccountWhere){
        let objectFilter = JSON.parse(JSON.stringify(params.where.AccountWhere));
        whereFilterAccount = replaceOperators(objectFilter);
    }

    const purchases = await db.Purchase.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } },
        include: [ 
            { model: db.Product },
            { model: db.Coupon },
            { model: db.QrCode },
            { model: db.Discount },
            { 
                model: db.Account,
                where: whereFilterAccount || { id: { [Op.gt]: 0 } }
             },
        ],
        distinct: true,
      });
    //const purchases = await db.Purchase.findAll();
    return purchases; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const purchase = await db.Purchase.findAll({
        where: obj
      });
    if (!purchase) throw 'Purchase not found';
    return purchase;
}

async function getById(id) {
    const purchase = await getPurchase(id);
    return purchase;
}

async function create(params) {
    const purchase = new db.Purchase(params);

    // save purchase
    await purchase.save();

    return purchase;
}

async function update(id, params) {
    const purchase = await getPurchase(id);

    // copy params to purchase and save
    Object.assign(purchase, params);
    purchase.updated = Date.now();
    await purchase.save();

    return purchase;
}

async function _delete(id) {
    const purchase = await getPurchase(id);
    await purchase.destroy();
}

// helper functions

async function getPurchase(id) {
    const purchase = await db.Purchase.findByPk(id);
    if (!purchase) throw 'Purchase not found';
    return purchase;
}

async function bulkCreate(params) {
    const purchases = await db.Purchase.bulkCreate(params, {returning:true} );
    return purchases;
}

async function bulkDelete(params) {
    await db.Purchase.destroy({ where: {id : params} });
}