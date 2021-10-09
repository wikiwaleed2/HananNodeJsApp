const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        highlights: { type: DataTypes.STRING, allowNull: false },
        code: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false }, // feature / promotional etc...
        status: { type: DataTypes.STRING, allowNull: false }, // sold out / active / pending etc...

        totalCoupons: { type: DataTypes.INTEGER, allowNull: false },
        soldCoupons: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        perEntryCoupons: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        couponPrice: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },

        startDate: { type: DataTypes.DATE, allowNull: false },
        drawDate: { type: DataTypes.DATE, allowNull: false },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        
        // banner, pictures, charity, winners, testinmonial, tags, coupons, cash alternative
        // recommendations, 
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('campaign', attributes, options);
}