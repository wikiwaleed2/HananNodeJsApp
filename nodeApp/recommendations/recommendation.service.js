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

    const recommendations = await db.Recommendation.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const recommendations = await db.Recommendation.findAll();
    return recommendations; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const recommendation = await db.Recommendation.findAll({
        where: obj
      });
    if (!recommendation) throw 'Recommendation not found';
    return recommendation;
}

async function getById(id) {
    const recommendation = await getRecommendation(id);
    return recommendation;
}

async function create(params) {
    const recommendation = new db.Recommendation(params);

    // save recommendation
    await recommendation.save();

    return recommendation;
}

async function update(id, params) {
    const recommendation = await getRecommendation(id);

    // copy params to recommendation and save
    Object.assign(recommendation, params);
    recommendation.updated = Date.now();
    await recommendation.save();

    return recommendation;
}

async function _delete(id) {
    const recommendation = await getRecommendation(id);
    await recommendation.destroy();
}

// helper functions

async function getRecommendation(id) {
    const recommendation = await db.Recommendation.findByPk(id);
    if (!recommendation) throw 'Recommendation not found';
    return recommendation;
}