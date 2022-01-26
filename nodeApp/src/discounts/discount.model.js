const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        code: { type: DataTypes.STRING, allowNull: false },
        discount: { type: DataTypes.STRING, allowNull: false },
        expiry: { type: DataTypes.DATE },
        timesUsed:{ type: DataTypes.INTEGER, allowNull: false, default:0 },
        limit:{ type: DataTypes.INTEGER, allowNull: false, default:0 }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('discount', attributes, options);
}