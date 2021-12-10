const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        code: { type: DataTypes.STRING },
        hash: { type: DataTypes.STRING, allowNull: false }, 
        type: { type: DataTypes.STRING, allowNull: false }, // User or Admins
        url: { type: DataTypes.STRING, allowNull: false }, 
        status: { type: DataTypes.STRING }, 
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('qrCode', attributes, options);
}