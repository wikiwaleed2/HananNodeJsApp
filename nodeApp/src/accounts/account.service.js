﻿const config = require('./../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('./../_helpers/send-email');
const db = require('./../_helpers/db');
const Role = require('./../_helpers/role');
const CustomModel = require('./../accounts/custom.model');
const NodeGoogleLogin = require('node-google-login');
const { param } = require('./accounts.controller');
const  replaceOperators  = require('./../_helpers/map-where');

module.exports = {
    authenticate,
    authenticateUsingGoogle,
    registerAsGuest,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    //CustomModel.getAllEmployees(); //# Test Custom Model
    const account = await db.Account.scope('withHash').findOne({ 
        where: { email },
        include: [
            {
                model: db.DreamCoin,
                attributes: ["balance"],
            }
        ]
    });

    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    
    // return basic details and tokens
    //delete account.dreamCoin;
    return {
        ...basicDetails(account),
        jwtToken,
        tempRefreshToken:refreshToken.token,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    const dreamCoin = await db.DreamCoin.findOne({ where: { accountId: account.id } });
    return {
        ...basicDetails(account),
        dreamCoins : dreamCoin.balance,
        jwtToken,
        tempRefreshToken:newRefreshToken.token,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        throw "Email already registered";
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = await hash(params.password);
    account.picUrl = (!params.picUrl)  ? "https://dreammakersbucket.s3.ap-southeast-1.amazonaws.com/pictures/defaul_user.jpeg" : params.picUrl;
    account.externalToken = 'NA';

    

    // save account
    const accountCreated = await account.save();

    // create dream coins
    const dreamCoins = new  db.DreamCoin();
    dreamCoins.balance = 0;
    dreamCoins.accountId = accountCreated.id;
    dreamCoins.save();

    // send email
    await sendVerificationEmail(account, origin, params.password);
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Invalid token';

    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    // update password and remove reset token
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function getAll(params) {
    let whereFilter = undefined;
    if(params.where){
        let objectFilter = JSON.parse(JSON.stringify(params.where));
        whereFilter = replaceOperators(objectFilter);
    }
    const accounts = await db.Account.findAndCountAll({
        limit: params.limit || 100,
        offset: params.offset || 0,
        order: params.order || [['id', 'ASC']],
        where: whereFilter|| { id: { [Op.gt]: 0 } },
        distinct: true,
      });
      return accounts;
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = await hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    if(params.password) {
        sendPasswordUpdatedEmail(account, params.password);
    }
    else{
        sendAccountInfoUpdatedEmail(account, params.password);
    }
    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

// helper functions

async function getAccount(id) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified, dreamCoins, picUrl, mobileNumber, nationality, countryResidence, city} = account;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified, dreamCoins, picUrl, mobileNumber, nationality, countryResidence, city };
}

async function sendVerificationEmail(account, origin, password) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               <h5>username:${account.email}</h3>
               <h5>password:${password}</h5>

               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    //origin = "https://test.dreammakers.ae"
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}

async function authenticateUsingGoogle({email, firstName, lastName, imageUrl, nationality, countryResidence, city, mobileNumber, externalToken, ipAddress }) {
    const defaultPassword = "Dreammakers.1&";
    //CustomModel.getAllEmployees(); //# Test Custom Model
    let account = await db.Account.scope('withHash').findOne({ where: { externalToken } });
    if (!account || !account.isVerified || !(await bcrypt.compare(defaultPassword, account.passwordHash))) {
        // create account object
        account = new db.Account({email, firstName, lastName, imageUrl, ipAddress});
        account.title = "Dear";
        account.verified =  Date.now();
        account.role =  Role.User;
        account.picUrl = imageUrl;
        account.nationality = nationality;
        account.countryResidence = countryResidence;
        account.city = city;
        account.mobileNumber = mobileNumber;
        account.verificationToken = randomTokenString();
        account.passwordHash = await hash(defaultPassword);
        account.externalToken = externalToken;

        // save account
        const accountCreated = await account.save();
        
        // create dream coins
        const dreamCoins = new  db.DreamCoin();
        dreamCoins.balance = 0;
        dreamCoins.accountId = accountCreated.id;
        dreamCoins.save();
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        tempRefreshToken:refreshToken.token,
        refreshToken: refreshToken.token
    };
  }

  async function sendPasswordUpdatedEmail(account, password) {
    await sendEmail({
        to: account.email,
        subject: 'Dreammakers Password Updated',
        html: `<h4>Your password has been updated</h4>
               <p>New password: <strong>${password}</strong> </p>`
    });
}

    async function sendAccountInfoUpdatedEmail(account, password) {
        await sendEmail({
            to: account.email,
            subject: 'Dreammakers Account Info Updated',
            html: `<h4>Your account information has been updated</h4>`
        });
}

async function registerAsGuest(params, origin) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        throw "Email already registered";
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = await hash(params.password);
    account.picUrl = (!params.picUrl)  ? "https://dreammakersbucket.s3.ap-southeast-1.amazonaws.com/pictures/defaul_user.jpeg" : params.picUrl;
    account.verified = new Date();
    account.externalToken = 'NA';
    account.nationality = 'NA';
    account.city = 'NA';
    account.countryResidence = 'NA';
    

    // save account
    const accountCreated = await account.save();

    // create dream coins
    const dreamCoins = new  db.DreamCoin();
    dreamCoins.balance = 0;
    dreamCoins.accountId = accountCreated.id;
    dreamCoins.save();
    await sendWelcomeEmail(account, origin, params.password);
}

async function sendWelcomeEmail(account, origin, password) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Welcome',
        html: `<h4>Welcome to DreamMakers</h4>
               <p>Thanks for registering!</p>
               <h5>username:${account.email}</h3>
               <h5>password:${password}</h5>`
    });
}
