const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        balance: { type: DataTypes.INTEGER, allowNull: false },
        currencyValue: {
            type: DataTypes.VIRTUAL,
            get() { return this.balance/100 }
        },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('discount', attributes, options);
}