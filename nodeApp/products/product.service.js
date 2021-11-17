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

    const products = await db.Product.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const products = await db.Product.findAll();
    return products; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const product = await db.Product.findAll({
        where: obj
      });
    if (!product) throw 'Product not found';
    return product;
}

async function getById(id) {
    const product = await getProduct(id);
    return product;
}

async function create(params) {
    const product = new db.Product(params);

    // save product
    await product.save();

    return product;
}

async function update(id, params) {
    const product = await getProduct(id);

    // copy params to product and save
    Object.assign(product, params);
    product.updated = Date.now();
    await product.save();

    return product;
}

async function _delete(id) {
    const product = await getProduct(id);
    await product.destroy();
}

// helper functions

async function getProduct(id) {
    const product = await db.Product.findByPk(id);
    if (!product) throw 'Product not found';
    return product;
}


async function bulkCreate(params) {
    const products = await db.Product.bulkCreate(params, {returning:true} );
    return products;
}

async function bulkDelete(params) {
    await db.Product.destroy({ where: {id : params} });
}