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

const QRCode = require('qrcode');

module.exports = {
    getAll,
    getWhere,
    getById,
    create,
    update,
    delete: _delete,
    bulkCreate,
    bulkDelete,
    generateQrCode
};

async function getAll(params) {
    let whereFilter = undefined;
    if(params.where){
        let objectFilter = JSON.parse(JSON.stringify(params.where));
        whereFilter = replaceOperators(objectFilter);
    }
    
    const qrCodes = await db.QrCode.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const qrCodes = await db.QrCode.findAll();
    return qrCodes; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const qrCode = await db.QrCode.findAll({
        where: obj
      });
    if (!qrCode) throw 'QrCode not found';
    return qrCode;
}

async function getById(id) {
    const qrCode = await getQrCode(id);
    return qrCode;
}

async function create(params) {
    const qrCode = new db.QrCode(params);
    
    // save qrCode
    await qrCode.save();

    return qrCode;
}

async function update(id, params) {
    const qrCode = await getQrCode(id);

    // copy params to qrCode and save
    Object.assign(qrCode, params);
    qrCode.updated = Date.now();
    await qrCode.save();

    return qrCode;
}

async function _delete(id) {
    const qrCode = await getQrCode(id);
    await qrCode.destroy();
}

// helper functions

async function getQrCode(id) {
    const qrCode = await db.QrCode.findByPk(id);
    if (!qrCode) throw 'QrCode not found';
    return qrCode;
}

async function bulkCreate(params) {
    const qrCode = await db.QrCode.bulkCreate(params, {returning:true} );
    return qrCode;
}

async function bulkDelete(params) {
    await db.QrCode.destroy({ where: {id : params} });
}

async function generateQrCode(req) {
    const params = req.body;
    const user = req.user;
    const account = await db.Account.findByPk(user.id);
    if (!account) throw 'Account not found';
    const userHash = getRandomNumber();
    const adminHash = getRandomNumber();
    console.log(params.code);
    console.log(user.id);

    QRCode.toFile('./assets/'+userHash+'user.png', userHash, {
        color: {
          dark: '#000',  
          light: '#0000' 
        }
      }, function (err) {
        if (err) throw err
      });

    QRCode.toFile('./assets/'+userHash+'admin.png', adminHash, {
    color: {
        dark: '#000',  
        light: '#0000' 
    }
    }, function (err) {
    if (err) throw err
    //console.log('done')
    });

    // Create a coupon
    const coupon = new db.Coupon(params);
    await coupon.save();

    //upload QrFiles to S3 and get Urls and delete files on local
    // ***** ///

    // Create two coupon codes for the coupon  
    // * Note save the hashes in hashes not as it is, like the password //
    const qrCodeUser = new db.QrCode(params);
    const qrCodeAdmin = new db.QrCode(params);
    await qrCodeUser.save();
    await qrCodeAdmin.save();
    // return the url for the userCoupon or throw an error
    return qrCodeUser.url;
}

function getRandomNumber(){
    return (Date.now() + Math.floor(Math.random()*(1000-100+1)+100)).toString();
}