const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        
        originalPrice: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
        paidByDreamCoins: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
        discountApplied: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
        cashPaid: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        // amountPaid: {
        //     type: DataTypes.VIRTUAL,
        //     get() { return !!( (this.inStock > 0) || this.expiry < DataTypes.NOW); }
        // }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('purchase', attributes, options);
}