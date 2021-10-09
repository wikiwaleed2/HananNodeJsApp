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

    // define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.Campaign.hasMany(db.Product, { onDelete: 'CASCADE' });
    db.Product.belongsTo(db.Campaign);
    
    // sync all models with database
    await sequelize.sync();
}


