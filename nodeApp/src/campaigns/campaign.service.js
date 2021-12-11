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
    bulkDelete,
    getAdminQrCodes
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
        where: whereFilter|| { id: { [Op.gt]: 0 } },
        distinct: true,
        include: [ 
            { model: db.Picture },
            { model: db.Winner },  
            { 
                model: db.Tag,
                //attributes: ["id", "name"],
                through: {
                    attributes: []
                }
            } 
        ]
      });
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
    return campaign;
}

async function create(params) {
    const campaign = new db.Campaign(params);
    await campaign.save();
    return campaign;
}

async function update(id, params) {
    const campaign = await getCampaign(id);

    
    // copy params to campaign and save
    Object.assign(campaign, params);
    campaign.updated = Date.now();
    await campaign.save();

    return campaign;
}

async function _delete(id) {
    const campaign = await getCampaign(id);
    await campaign.destroy();
}

// helper functions

async function getCampaign(id) {
    //const campaign = await db.Campaign.findByPk(id);
    //return campaign;
    const campaign = await db.Campaign.findOne({
        where: {
          id: id,
        },
        include:[{model:db.Picture}]
      });
    return campaign;
}

async function bulkCreate(params) {
    const Campaigns = await db.Campaign.bulkCreate(params, {returning:true} );
    return Campaigns;
}

async function bulkDelete(params) {
    await db.Campaign.destroy({ where: {id : params} });
}

async function getAdminQrCodes(id) {
    const campaign = await db.Campaign.findByPk(id);
    if (!campaign) throw 'Campaign not found';
    const codes = await db.QrCode.findAndCountAll({
        limit: 1000,
        offset:  0,
        order:  [['id', 'ASC']],
        where: { campaignId: id, type: 'admin' },
        distinct: true
      });
    return codes;
}