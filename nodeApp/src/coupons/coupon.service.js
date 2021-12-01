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
const AWS = require('aws-sdk');
const fs = require('fs');
require("dotenv").config();
const moment = require('moment');

module.exports = {
    getAll,
    getWhere,
    getById,
    create,
    update,
    delete: _delete,
    bulkCreate,
    bulkDelete,
    buyCoupons
};

async function getAll(params) {
    let whereFilter = undefined;
    if(params.where){
        let objectFilter = JSON.parse(JSON.stringify(params.where));
        whereFilter = replaceOperators(objectFilter);
    }
    
console.log(whereFilter);

    const coupons = await db.Coupon.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });
    //const coupons = await db.Coupon.findAll();
    return coupons; 
}

async function getWhere(whereClause) {
    const obj = JSON.parse(whereClause);
    const coupon = await db.Coupon.findAll({
        where: obj
      });
    if (!coupon) throw 'Coupon not found';
    return coupon;
}

async function getById(id) {
    const coupon = await getCoupon(id);
    return coupon;
}

async function create(params) {
    const coupon = new db.Coupon(params);

    // save coupon
    await coupon.save();

    return coupon;
}

async function update(id, params) {
    const coupon = await getCoupon(id);

    // copy params to coupon and save
    Object.assign(coupon, params);
    coupon.updated = Date.now();
    await coupon.save();

    return coupon;
}

async function _delete(id) {
    const coupon = await getCoupon(id);
    await coupon.destroy();
}

// helper functions

async function getCoupon(id) {
    const coupon = await db.Coupon.findByPk(id);
    if (!coupon) throw 'Coupon not found';
    return coupon;
}

async function bulkCreate(params) {
    const coupons = await db.Coupon.bulkCreate(params, {returning:true} );
    return coupons;
}

async function bulkDelete(params) {
    await db.Coupon.destroy({ where: {id : params} });
}

async function buyCoupons(req) {
    // Manage purchase with dreamcoins, discount, charitypartner, payment info, coupons, qrcodes, (tags)
    let responseArray = [];
    const transaction = await db.sequelize.transaction();
    try{
        const params = req.body;
        const user = req.user;
        const totalCouponsPurchased = params.totalPurchasedCoupons;

        // need account to attach to purchase and others and update tags
        const account = await db.Account.findByPk(user.id, {transaction});
        if (!account) throw 'Account not found';

        // need campaign to update counter
        const campaign = await db.Campaign.findByPk(params.campaignId, {transaction});
        if (!campaign) throw 'Campaign not found';
        campaign.soldCoupons += totalCouponsPurchased;
        if(totalCouponsPurchased < campaign.perEntryCoupons) throw 'Need more coupons for entry!'
        if(campaign.totalCoupons < campaign.soldCoupons) {console.log(campaign); throw 'Housefull!';}
        
        campaign.save({transaction});


        // need discount to attach to purchase
        let discount = null; 
        if(params.discountCode)
        discount = await db.Discount.findOne({ where: { code: params.discountCode } }, {transaction});
        if (params.discountCode && !discount) throw 'Discount Code not found';  

        // need dreamcoins to update 
        let dreamCoins = null; 
        //if(params.dreamCoinsUsed > 0)
        dreamCoins = await db.DreamCoin.findOne({ where: { accountId: user.id } }, {transaction});
        if (params.dreamCoinsUsed>0 && !dreamCoins) throw 'Dream Coins not found';
        dreamCoins.balance = dreamCoins.balance - params.dreamCoinsUsed;
        dreamCoins.updated = Date.now();
        dreamCoins.balance = dreamCoins.balance + params.actualPrice;
        await dreamCoins.save({transaction});

        // need to update balance
        let charitypartner = await db.CharityPartner.findByPk(campaign.charityPartnerId, {transaction}); 
        if(charitypartner) {
            charitypartner.fundRaised =  parseFloat(charitypartner.fundRaised) + parseFloat(params.cashPaid / 100);
            charitypartner.updated = Date.now();
            await charitypartner.save({transaction});
        }

        // need a purchase to attach to coupons
        let purchase = new db.Purchase();
        purchase.originalPrice = params.actualPrice;
        purchase.paidByDreamCoins = parseFloat(params.dreamCoinsUsed / 100);
        purchase.discountApplied = params.discountAmount;
        purchase.cashPaid = params.cashPaid;
        if(discount) {
            purchase.discountId = discount.id;
            discount.timesUsed += totalCouponsPurchased;
            console.log(totalCouponsPurchased);
            discount.save({transaction});
        }
        purchase.paymentTokenId = params.payment_token_id;
        purchase.typeOfPayment = params.type_of_payment;
        purchase.payemntInstrument = params.payemnt_instrument;
        purchase.payemntInstrumentType = params.payemnt_instrument_type;
        purchase.accountId = user.id;
        await purchase.save({transaction});

        
        for(let i=0; i<totalCouponsPurchased; i++){
            //need coupon to attach to qr codes
            let coupon = new db.Coupon();
            coupon.campaignId = campaign.id;
            coupon.accountId = user.id;
            coupon.purchaseId = purchase.id;
            coupon.code = getRandomNumber();
            await coupon.save({transaction});
            
            // need to upload qrcodes to s3
            let userHash = getRandomNumber();
            let adminHash = getRandomNumber();
            let userQrUrl = await generateAndUploadQrPic(userHash);
            let adminQrUrl = await generateAndUploadQrPic(adminHash);

            // need to generate qrcode for user
            let qrCodeUser = new db.QrCode();
            qrCodeUser.couponId = coupon.id;
            qrCodeUser.code = "EL-" + userHash.substr(3,5) + '-' + userHash.substr(9,5);
            qrCodeUser.hash = userHash;
            qrCodeUser.type = 'user';
            qrCodeUser.url = userQrUrl;
            await qrCodeUser.save({transaction});

            // need to generate qrcode for admin
            let qrCodeAdmin = new db.QrCode();
            qrCodeAdmin.couponId = coupon.id;
            qrCodeAdmin.code = "EL-" + adminHash.substr(3,5) + '-' + adminHash.substr(9,5);
            qrCodeAdmin.hash = adminHash;
            qrCodeAdmin.type = 'admin';
            qrCodeAdmin.url = adminQrUrl;
            await qrCodeAdmin.save({transaction});
            
            // need to put the qrcode into response
            let tempCouponInfo = {};
            tempCouponInfo.code = qrCodeUser.code;
            tempCouponInfo.qrCode = qrCodeUser.url;
            tempCouponInfo.campaign = campaign.name;
            tempCouponInfo.firstName = account.firstName;
            tempCouponInfo.lastName = account.lastName;
            tempCouponInfo.purchaseDate = moment(purchase.created).format("hh:mm A, d MMMM yyyy");
            responseArray.push(tempCouponInfo);
        }

        await transaction.commit();
        return responseArray;

    }catch(error){
        await transaction.rollback();
        throw error;
    }
    
}

function getRandomNumber(){
    return (Math.floor(Math.random()*(99000-10000+1)+10000)).toString() + Date.now() + Math.floor(Math.random()*(99000-10000+1)+10000).toString();
}

function getRandomNumberSmall(){
    return (Math.floor(Math.random()*(99000-10+1)+10)).toString();
}

async function generateAndUploadQrPic(code){
    filename = './assets/'+code+'.png';
    const fileOnDisk = await QRCode.toFile(filename, code, {
        color: {
          dark: '#000',  
          light: '#0000' 
        }
    });
    const picUrl = await uploadFile(filename);
    deleteFile(filename);
    console.log(picUrl);
    return picUrl;
}

async function uploadFile(filename){
    const fileContent = fs.readFileSync(filename);
    const s3 = new AWS.S3({
        accessKeyId:  process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey
    });
    const filenameS3 = getRandomNumberSmall() + filename.replace('./assets/','').replace('.png','') + getRandomNumberSmall() + '.png';
    const configS3 = {
        Bucket: process.env.bucketName, // pass your bucket name
        Key: process.env.dirName +'/'+ filenameS3,
        Body: fileContent,
        ContentType: "image/png",
        ACL:'public-read'
    };
    respS3 = await s3.upload(configS3).promise();
    return respS3.Location;
}

async function deleteFile(filename){
    try {
        fs.unlinkSync(filename)
      } catch(err) {
        console.error(err)
      }
}