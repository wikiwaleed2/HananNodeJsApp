const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        code: { type: DataTypes.STRING, allowNull: false },
        discount: { type: DataTypes.STRING, allowNull: false },
        expiry: { type: DataTypes.DATE },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('discount', attributes, options);
}