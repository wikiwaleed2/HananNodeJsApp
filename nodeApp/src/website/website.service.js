const config = require('./../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('./../_helpers/send-email');
const db = require('./../_helpers/db');
const Role = require('./../_helpers/role');
const { json } = require('body-parser');
const replaceOperators = require('./../_helpers/map-where');
const { param } = require('./website.controller');

module.exports = {
    getSettings,
    updateSettings
};

const defaultSettings = {
    //object containing fields and values to apply
    id: 1,
    isUnderConstruction: false,
    websiteTitle: 'DreamMakers',
    websiteIcon: 'NA',
    password: '1339'
};

async function getSettings() {
    const website = await db.Website.findOrCreate({
        where: {//object containing fields to found
            id: 1
        },
        defaults: defaultSettings
    });
    return website[0];
}

async function updateSettings(params) {
    console.log(params);
    const website = await db.Website.findByPk(1);
    //console.log(website);
    // copy params to discount and save
    Object.assign(website, params);
    website.updated = Date.now();
    await website.save();

    return website;
}
