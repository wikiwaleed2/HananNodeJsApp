﻿const config = require('./../config.json');
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
    
    const campaigns = await db.Campaign.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const campaigns = await db.Campaign.findAll();
    return campaigns; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const campaign = await db.Campaign.findAll({
        where: obj
      });
    if (!campaign) throw 'Campaign not found';
    return campaign;
}

async function getById(id) {
    const campaign = await getCampaign(id);
    return basicDetails(campaign);
}

async function create(params) {
    // validate
    // if (await db.Campaign.findOne({ where: { email: params.email } })) {
    //     throw 'Email "' + params.email + '" is already registered';
    // }

    const campaign = new db.Campaign(params);
    
    // save campaign
    await campaign.save();

    return campaign;
}

async function update(id, params) {
    const campaign = await getCampaign(id);

    // validate (if email was changed)
    if (params.email && campaign.email !== params.email && await db.Campaign.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to campaign and save
    Object.assign(campaign, params);
    campaign.updated = Date.now();
    await campaign.save();

    return basicDetails(campaign);
}

async function _delete(id) {
    const campaign = await getCampaign(id);
    await campaign.destroy();
}

// helper functions

async function getCampaign(id) {
    const campaign = await db.Campaign.findByPk(id);
    if (!campaign) throw 'Campaign not found';
    return campaign;
}