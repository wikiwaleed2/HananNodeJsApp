const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        
        originalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        paidByDreamCoins: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        discountApplied: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
        cashPaid: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
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