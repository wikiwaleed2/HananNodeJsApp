﻿const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('./../_helpers/send-email');
const db = require('./../_helpers/db');
const Role = require('./../_helpers/role');
const { json } = require('body-parser');
const replaceOperators = require('./../_helpers/map-where');
const config = require('./../config.json');
const nodemailer = require('nodemailer');
const dynamicMailTemplate = require('./templates/dynamicMailTemplate');

module.exports = {
    sendEmailWithPromiseWithDynamicData,
};

async function sendEmailWithPromiseWithDynamicData(params) {
    //let mailOptions = await mailOptionsForDynamicMail()
    let mailOptions = {
        from:config.emailFrom,
        to: params.to, // list of receivers
        subject: params.subject, // Subject line
        html: await dynamicMailTemplate(params?.parameters), // html body
        attachments: [
            {   // utf-8 string as an attachment
                filename: params?.filename, // file name, like 'test.pdf'
                href: params?.href // link to the file, like http://example.com/invoices/test.pdf 
            }
        ]
    };
    const transporter = nodemailer.createTransport(config.smtpOptions);
    return transporter.sendMail(mailOptions);
}

// async function mailOptionsForDynamicMail() {
//     return {
//         to: "waleed@s4-digital.com", // list of receivers
//         subject: "Test Subject", // Subject line
//         html: await dynamicMailTemplate('Extraaa'), // html body
//         attachments: [
//             {   // utf-8 string as an attachment
//                 filename: "anyName.pdf", // file name, like 'test.pdf'
//                 href: "https://www.cplusplus.com/files/tutorial.pdf" // link to the file, like http://example.com/invoices/test.pdf
//             }
//         ]
//     };
// }



// "smtpOptions": {
//     "service":"gmail",
//     "host": "smtp.gmail.com",
//     "port": 465,
//     "secure":true,
//     "auth": {
//       "user": "test3036838220@gmail.com",
//       "pass": "Pakistan.1&"
//     }
//   },




// "smtpOptions": {
//     "service":"dreammakers",
//     "host": "mail.dreammakers.ae",
//     "port": 587,
//     "secure":false,
//     "auth": {
//       "user": "support@dreammakers.ae",
//       "pass": "Pakistan.1&"
//     },
//     "tls": {
//       "rejectUnauthorized": false
//     }
//   },