const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        company: { type: DataTypes.STRING, allowNull: true },
        manufacturer: { type: DataTypes.STRING, allowNull: false },
        country: { type: DataTypes.STRING, allowNull: false },
        expiry: { type: DataTypes.BOOLEAN },
        price: { type: DataTypes.BIGINT },
        pictureId: { type: DataTypes.STRING, allowNull: false },
        inStock: { type: DataTypes.INTEGER, allowNull: false },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        isValid: {
            type: DataTypes.VIRTUAL,
            get() { return !!( (this.inStock > 0) || this.expiry < DataTypes.NOW); }
        }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('testimonial', attributes, options);
}