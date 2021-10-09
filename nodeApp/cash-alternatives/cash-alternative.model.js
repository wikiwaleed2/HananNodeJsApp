const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.BIGINT, allowNull: false },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('cashAlternative', attributes, options);
}