const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        
        dreamCoinsUsed: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
        currencyUsed: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
        paidAmount: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, // can be calucated by purchase->all coupons's price sum
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        amountPaid: {
            type: DataTypes.VIRTUAL,
            get() { return !!( (this.inStock > 0) || this.expiry < DataTypes.NOW); }
        }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('purchase', attributes, options);
}