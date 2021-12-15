const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        url: { type: DataTypes.STRING, allowNull: false },
        alt: { type: DataTypes.STRING },
        type: { type: DataTypes.STRING, allowNull: false }, // thumbnail / normal / icon / banner etc...
        status: { type: DataTypes.STRING, allowNull: false }, // in-active etc / active / pending etc...
        format: { type: DataTypes.STRING },
        category: { type: DataTypes.STRING },  // capmaign-image-gallery // charity-partner-image-gallery // charity-partner-desktop-imaage
        platform: { type: DataTypes.STRING },  // mobile //desktop
        description: { type: DataTypes.STRING, allowNull: false }, // name + type + status + format + category + platform 

        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('picture', attributes, options);
}