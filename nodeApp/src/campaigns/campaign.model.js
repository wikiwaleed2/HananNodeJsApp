const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        shortTitleDescriptionDesktop: { type: DataTypes.STRING, allowNull: false },
        shortTitleDescriptionMobile: { type: DataTypes.STRING, allowNull: false },
        shortDescriptionDesktop: { type: DataTypes.STRING, allowNull: false },
        shortDescriptionMobile: { type: DataTypes.STRING, allowNull: false },
        prizeTitleDesktop: { type: DataTypes.STRING, allowNull: false },
        prizeTitleMobile: { type: DataTypes.STRING, allowNull: false },
        whereToShow: { type: DataTypes.STRING, allowNull: false },
        sort: { type: DataTypes.STRING, allowNull: false },
        active: { type: DataTypes.BOOLEAN, allowNull: false },
        
        highlights: { type: DataTypes.TEXT, allowNull: false },
        code: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false }, // feature / promotional etc...
        status: { type: DataTypes.STRING, allowNull: false }, // sold out / active / pending / drawn-out etc...

        totalCoupons: { type: DataTypes.INTEGER, allowNull: false ,defaultValue: 60 },
        soldCoupons: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        perEntryCoupons: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        couponPrice: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },

        startDate: { type: DataTypes.DATE, allowNull: false },
        drawDate: { type: DataTypes.DATE, allowNull: false },
        winningPrizeTitle: { type: DataTypes.STRING, allowNull: false },
        embedHtmlYouTube: { type: DataTypes.TEXT },
        embedHtmlFacebook: { type: DataTypes.TEXT },
        embedHtmlTwitter: { type: DataTypes.TEXT },
        embedHtmlOther1: { type: DataTypes.TEXT },
        embedHtmlOther2: { type: DataTypes.TEXT },
        prizePartner: { type: DataTypes.STRING },
        cashAlternative: { type: DataTypes.BOOLEAN },

        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        
        // banner, pictures, charity, winners, testinmonial, tags, coupons, cash alternative
        // recommendations, 
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('campaign', attributes, options);
}