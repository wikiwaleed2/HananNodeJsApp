const config = require('./../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('./../_helpers/send-email');
const db = require('./../_helpers/db');
const Role = require('./../_helpers/role');
const { json } = require('body-parser');

module.exports = {
    getAll,
    getWhere,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    const products = await db.Product.findAll();
    return products.map(x => basicDetails(x));
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
    return basicDetails(product);
}

async function create(params) {
    // validate
    if (await db.Product.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const product = new db.Product(params);
    product.verified = Date.now();

    // hash password
    product.passwordHash = await hash(params.password);

    // save product
    await product.save();

    return basicDetails(product);
}

async function update(id, params) {
    const product = await getProduct(id);

    // validate (if email was changed)
    if (params.email && product.email !== params.email && await db.Product.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to product and save
    Object.assign(product, params);
    product.updated = Date.now();
    await product.save();

    return basicDetails(product);
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