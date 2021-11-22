const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING },
        price: { type: DataTypes.BIGINT },
        title: { type: DataTypes.STRING },
        type: { type: DataTypes.STRING, allowNull: false }, // User or Admins
        hash: { type: DataTypes.STRING, allowNull: false }, 
        url: { type: DataTypes.STRING, allowNull: false }, 
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('qrCode', attributes, options);
}