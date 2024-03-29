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

    const testimonials = await db.Testimonial.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const testimonials = await db.Testimonial.findAll();
    return testimonials; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const testimonial = await db.Testimonial.findAll({
        where: obj
      });
    if (!testimonial) throw 'Testimonial not found';
    return testimonial;
}

async function getById(id) {
    const testimonial = await getTestimonial(id);
    return testimonial;
}

async function create(params) {
    const testimonial = new db.Testimonial(params);

    // save testimonial
    await testimonial.save();

    return testimonial;
}

async function update(id, params) {
    const testimonial = await getTestimonial(id);

    // copy params to testimonial and save
    Object.assign(testimonial, params);
    testimonial.updated = Date.now();
    await testimonial.save();

    return testimonial;
}

async function _delete(id) {
    const testimonial = await getTestimonial(id);
    await testimonial.destroy();
}

// helper functions

async function getTestimonial(id) {
    const testimonial = await db.Testimonial.findByPk(id);
    if (!testimonial) throw 'Testimonial not found';
    return testimonial;
}

async function bulkCreate(params) {
    const testimonials = await db.Testimonial.bulkCreate(params, {returning:true} );
    return testimonials;
}

async function bulkDelete(params) {
    await db.Testimonial.destroy({ where: {id : params} });
}
