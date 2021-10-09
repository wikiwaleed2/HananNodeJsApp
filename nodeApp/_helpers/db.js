const config = require('./../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

// const dbConn = mysql.createConnection({
//     host     : config.database.host,
//     user     : config.database.user,
//     password : config.database.password,
//     database : config.database.database
//   });  
// module.exports = dbConn;



initialize();

async function initialize() {
    // create db if it doesn't already exist
     const { host, port, user, password, database } = config.database;
     const connection = await mysql.createConnection({ host, port, user, password });
     await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
     
    
    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    //# for executing raw sql queries
    db.connection = connection;
    db.connection.query(`use \`${database}\`;`);
    //# await db.connection.query(`select * from accounts where id < 3;`);

    // init models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);

    db.Product = require('../products/product.model')(sequelize);
    db.Campaign = require('../campaigns/campaign.model')(sequelize);
    db.Picture = require('../pictures/picture.model')(sequelize);
    db.CashAlternative = require('../cash-alternatives/cash-alternative.model')(sequelize);
    db.Testimonial = require('../testimonials/testimonial.model')(sequelize);
    db.Winner = require('../winners/winner.model')(sequelize);
    db.Tag = require('../tags/tag.model')(sequelize);
    db.CharityPartner = require('../charitypartners/charitypartner.model')(sequelize);
    db.Coupon = require('../coupons/coupon.model')(sequelize);
    db.QrCode = require('../qrcodes/qrcode.model')(sequelize);

    // define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' }); db.RefreshToken.belongsTo(db.Account);
    db.Account.hasMany(db.Campaign, { onDelete: 'CASCADE' }); db.Campaign.belongsTo(db.Account);

    // Campain Relations
    db.Campaign.hasMany(db.Product, { onDelete: 'CASCADE' }); db.Product.belongsTo(db.Campaign);
    db.Campaign.hasMany(db.CashAlternative, { onDelete: 'CASCADE' }); db.CashAlternative.belongsTo(db.Campaign);
    db.Campaign.hasMany(db.Testimonial, { onDelete: 'CASCADE' }); db.Testimonial.belongsTo(db.Campaign);
    db.Campaign.hasMany(db.Winner, { onDelete: 'CASCADE' }); db.Winner.belongsTo(db.Campaign);
    db.Campaign.hasMany(db.Tag, { onDelete: 'CASCADE' }); db.Tag.belongsTo(db.Campaign);
    db.Campaign.hasMany(db.CharityPartner, { onDelete: 'CASCADE' }); db.CharityPartner.belongsTo(db.Campaign);
    db.Campaign.hasMany(db.Coupon, { onDelete: 'CASCADE' }); db.Coupon.belongsTo(db.Campaign);

    // Picture Relations
    db.Account.hasMany(db.Picture, { onDelete: 'CASCADE' }); db.Picture.belongsTo(db.Account);
    db.Campaign.hasMany(db.Picture, { onDelete: 'CASCADE' }); db.Picture.belongsTo(db.Campaign);
    db.Product.hasMany(db.Picture, { onDelete: 'CASCADE' }); db.Picture.belongsTo(db.Product);
    db.Coupon.hasMany(db.Picture, { onDelete: 'CASCADE' }); db.Picture.belongsTo(db.Coupon);
    db.QrCode.hasMany(db.Picture, { onDelete: 'CASCADE' }); db.Picture.belongsTo(db.QrCode);

    // Other Relations
    db.Coupon.hasMany(db.QrCode, { onDelete: 'CASCADE' }); db.QrCode.belongsTo(db.Coupon);
    
    
    // sync all models with database
    await sequelize.sync();
}


