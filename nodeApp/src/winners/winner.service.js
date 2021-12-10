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
const moment = require('moment');
const { group } = require('console');

module.exports = {
    getAll,
    getAllByDates,
    getWhere,
    getById,
    create,
    update,
    delete: _delete,
    bulkCreate,
    bulkDelete,
    scanWinner
};

async function getAll(params) {
    // created: {'$gt' : moment().subtract(5, 'days').toDate()} }
    let whereFilter = undefined;
    if(params.where){
        let objectFilter = JSON.parse(JSON.stringify(params.where));
        whereFilter = replaceOperators(objectFilter);
    }

    const winners = await db.Winner.findAndCountAll({
        limit: params.limit || 10,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } },
        include: [ 
            { model: db.Picture },
            { model: db.Campaign },  
            { model: db.Account },  
            { model: db.Coupon },  
        ]
      });
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

async function bulkCreate(params) {
    const winners = await db.Winner.bulkCreate(params, {returning:true} );
    return winners;
}

async function bulkDelete(params) {
    await db.Winner.destroy({ where: {id : params} });
}

// async function getAllByDates(params) {
//     let whereFilter = undefined;
//     if(params.where){
//         let objectFilter = JSON.parse(JSON.stringify(params.where));
//         whereFilter = replaceOperators(objectFilter);
//     }

//     const winners = await db.Winner.findAndCountAll({
//         limit: params.limit || 10,
//         offset: params.offset || 0,
//         order: params.order || [['id', 'ASC']],
//         where: whereFilter|| { id: { [Op.gt]: 0 } },
//         include: [ 
//             { model: db.Picture },
//             { model: db.Campaign },  
//             { model: db.Account },  
//             { model: db.Coupon, include:[ {model: db.QrCode }] },  
//         ]
//       });

//     // Changing Date Format
//     winners.rows = winners.rows.map(x => {
//         var temp = Object.assign({}, x.dataValues);
//         temp.created = moment(temp.created).format("MMMM d yyyy");
//         return temp;
//     });
//     // Grouping w.r.t item.created
//     const groups =  winners.rows.reduce((groups, item) => ({
//         ...groups,
//         [item.created]: [...(groups[item.created] || []), item]
//       }), []);
    
//     // reforming data according to requirements
//     const newObjArray = [];
//     for (const [key, value] of Object.entries(groups)) {
//         //console.log(key, value);
//         newObj = {};
//         newObj.created = key;
//         newObj.total = value.length;
//         newObj.DATA = value;
//         newObjArray.push(newObj);
//       }

//     return newObjArray; 
// }

async function scanWinner(params) {
    const qrCode = await db.QrCode.findOne({ where: { hash: params.code, type: 'admin' } });
    if(!qrCode) throw 'invalid QR';
    const coupon = await db.Coupon.findByPk(qrCode.couponId);
    if(!coupon) throw 'invalid Coupon';
    const qrCodeUser = await db.QrCode.findOne({ where: { couponId: coupon.id, type: 'user' } });
    if(!qrCodeUser) throw 'invalid QRcode user';
    const account = await db.Account.findByPk(coupon.accountId);
    if(!account) throw 'no account found against this QR';
    const campaign = await db.Campaign.findByPk(coupon.campaignId);
    if(!campaign) throw 'no campaign found';
    if(campaign.status == 'expired') throw `${campaign.id} campaign expired`;

    // Create and save winner
    const winner = new db.Winner();
    winner.fullName = account.firstName + ' ' + account.lastName;
    winner.designation = 'NA';
    winner.comments = 'NA';
    winner.country = 'NA';
    winner.picUrl = account.picUrl;
    winner.videoUrl = '';
    winner.qrCodeUrl = qrCodeUser.url;
    winner.couponNumber = qrCodeUser.code;
    winner.couponPurchaseDate = coupon.created;
    winner.campaignTitle = campaign.title;
    winner.winningPrizeTitle = campaign.winningPrizeTitle;
    winner.winningDate = Date.now();
    winner.created = Date.now();
    winner.campaignId = campaign.id;
    winner.couponId = coupon.id;
    winner.accountId = account.id;
    await winner.save();

    campaign.status = 'expired';
    await campaign.save();

    // Do it for all coupons and qr codes related to campaign
    // qrCode.status = 'expired';
    // qrCodeUser.status = 'expired';
    // coupon.status = 'expired';
    

    return {winner, account, coupon, qrCode};
}

async function getAllByDates(params) {
    let whereFilter = undefined;
    if(params.where){
        let objectFilter = JSON.parse(JSON.stringify(params.where));
        whereFilter = replaceOperators(objectFilter);
    }

    const winners = await db.Winner.findAndCountAll({
        limit: params.limit || 50,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } }
      });

    // Changing Date Format
    winners.rows = winners.rows.map(x => {
        var temp = Object.assign({}, x.dataValues);
        temp.created = moment(temp.created).format("MMMM d yyyy");
        return temp;
    });
    // Grouping w.r.t item.created
    const groups =  winners.rows.reduce((groups, item) => ({
        ...groups,
        [item.created]: [...(groups[item.created] || []), item]
      }), []);
    
    // reforming data according to requirements
    const newObjArray = [];
    for (const [key, value] of Object.entries(groups)) {
        //console.log(key, value);
        newObj = {};
        newObj.created = key;
        newObj.total = value.length;
        newObj.DATA = value;
        newObjArray.push(newObj);
      }

    return newObjArray; 
}
