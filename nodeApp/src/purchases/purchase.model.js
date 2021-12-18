const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        
        amount: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        transactionFee: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        taxRate: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        taxAmount: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        amountWithoutTax: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        paidByDreamCoins: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        paidByDiscountCode: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        paidByCard: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        status: { type: DataTypes.STRING, allowNull: false },
        productName: { type: DataTypes.STRING, allowNull: false },
        quantity: { type: DataTypes.STRING, allowNull: false },
        unitPrice: { type: DataTypes.STRING, allowNull: false },
        campaignNumber: { type: DataTypes.STRING, allowNull: false },
        campaignName: { type: DataTypes.STRING, allowNull: false },

        paymentTokenId: { type: DataTypes.STRING, allowNull: false },
        typeOfPayment: { type: DataTypes.STRING, allowNull: false },
        payemntInstrument: { type: DataTypes.STRING, allowNull: false },
        payemntInstrumentType: { type: DataTypes.STRING, allowNull: false },

        
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        // amountPaid: {
        //     type: DataTypes.VIRTUAL,
        //     get() { return !!( (this.inStock > 0) || this.expiry < DataTypes.NOW); }
        // }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('purchase', attributes, options);
}