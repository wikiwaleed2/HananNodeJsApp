const { DataTypes } = require('sequelize');
const moment = require('moment');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        type: { type: DataTypes.STRING, allowNull: false, defaultValue: "Normal" }, // normal or event or occasion or promotion etc
        status: { type: DataTypes.STRING, allowNull: false }, // active, inactive, pending, schedules etc
        startDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        endDate: { type: DataTypes.DATE, allowNull: false, defaultValue: moment().add(20, 'years').format("YYYY-MM-DD HH:mm:ss") },
         // need to atleast 10 years from now for normal ones, others can be decided
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE }
        
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('tag', attributes, options);
}