const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        fullName: { type: DataTypes.STRING, allowNull: false },
        designation: { type: DataTypes.STRING, allowNull: false },
        comments: { type: DataTypes.TEXT , allowNull: false },
        country: { type: DataTypes.STRING, allowNull: false },
        picUrl: { type: DataTypes.STRING, allowNull: false },
        videoUrl: { type: DataTypes.STRING, allowNull: false },
        qrCodeUrl: { type: DataTypes.STRING, allowNull: false },
        couponNumber: { type: DataTypes.STRING, allowNull: false },
        couponPurchaseDate: { type: DataTypes.DATE, allowNull: false },
        campaignTitle: { type: DataTypes.STRING, allowNull: false },
        winningPrizeTitle: { type: DataTypes.STRING, allowNull: false },
        winningDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        // isValid: {
        //     type: DataTypes.VIRTUAL,
        //     get() { return !!( (this.inStock > 0) || this.expiry < DataTypes.NOW); }
        // }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('winner', attributes, options);
}