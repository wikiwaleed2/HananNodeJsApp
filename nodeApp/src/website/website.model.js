const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        isUnderConstruction: { type: DataTypes.BOOLEAN, allowNull: false },
        websiteTitle: { type: DataTypes.STRING, allowNull: false },
        websiteIcon: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: true, 
    };

    return sequelize.define('websiteSetting', attributes, options);
}