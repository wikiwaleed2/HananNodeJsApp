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
    createCampaignTag,
    bulkCreateCampaignTag,
    deleteCampaignTag,
    bulkDeleteCampaignTag,
    createRecommendationTag,
    deleteRecommendationTag,
    bulkCreateRecommendationTag,
    bulkDeleteRecommendationTag,
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

async function bulkCreate(params) {
    const tags = await db.Tag.bulkCreate(params, {returning:true} );
    return tags;
}

async function bulkDelete(params) {
    await db.Tag.destroy({ where: {id : params} });
}

///---------------Campaign Tags-------------------------////// 
async function createCampaignTag(params) {
    const campaignTag = new db.CampaignTag(params);
    await campaignTag.save();
    return campaignTag;
}

async function deleteCampaignTag(id) {
    console.log(id);
    const ctag = await db.CampaignTag.findByPk(id);
    if (!ctag) throw 'CampaingTag not found';
    await ctag.destroy();
}

async function bulkCreateCampaignTag(params) {
    const campTags = await db.CampaignTag.bulkCreate(params, {returning:true} );
    return campTags;
}

async function bulkDeleteCampaignTag(params) {
    await db.CampaignTag.destroy({ where: {id : params} });
}

///---------------Recommendateion Tags-------------------------////// 
async function createRecommendationTag(params) {
    const recommendationTag = new db.RecommendationTag(params);
    await recommendationTag.save();
    return recommendationTag;
}

async function deleteRecommendationTag(id) {
    console.log(id);
    const recommendationTag = await db.RecommendationTag.findByPk(id);
    if (!recommendationTag) throw 'recommendation tag not found';
    await recommendationTag.destroy();
}

async function bulkCreateRecommendationTag(params) {
    const recommendationTags = await db.RecommendationTag.bulkCreate(params, {returning:true} );
    return recommendationTags;
}

async function bulkDeleteRecommendationTag(params) {
    await db.RecommendationTag.destroy({ where: {id : params} });
}