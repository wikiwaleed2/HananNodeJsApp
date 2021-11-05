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

    const winners = await db.Winner.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const winners = await db.Winner.findAll();
    return winners; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const winner = await db.Winner.findAll({
        where: obj
      });
    if (!winner) throw 'Winner not found';
    return winner;
}

async function getById(id) {
    const winner = await getWinner(id);
    return winner;
}

async function create(params) {
    const winner = new db.Winner(params);
    
    // save winner
    await winner.save();

    return winner;
}

async function update(id, params) {
    const winner = await getWinner(id);

    // copy params to winner and save
    Object.assign(winner, params);
    winner.updated = Date.now();
    await winner.save();

    return winner;
}

async function _delete(id) {
    const winner = await getWinner(id);
    await winner.destroy();
}

// helper functions

async function getWinner(id) {
    const winner = await db.Winner.findByPk(id);
    if (!winner) throw 'Winner not found';
    return winner;
}