const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        prizeTitle: { type: DataTypes.STRING, allowNull: false },
        videoUrl: { type: DataTypes.STRING, allowNull: false },
        comments: { type: DataTypes.STRING, allowNull: true },
        fullName: { type: DataTypes.STRING, allowNull: true },
        designation: { type: DataTypes.STRING, allowNull: false },
        videoUrl: { type: DataTypes.STRING, allowNull: false },
        picUrl: { type: DataTypes.STRING }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('testimonial', attributes, options);
}