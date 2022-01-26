const { string } = require('joi');
const { DataTypes } = require('sequelize');

module.exports = model;
   
function model(sequelize) {
    const attributes = {
        email: { type: DataTypes.STRING, allowNull: false },
        externalToken: { type: DataTypes.TEXT, allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        acceptTerms: { type: DataTypes.BOOLEAN },
        role: { type: DataTypes.STRING, allowNull: false },
        verificationToken: { type: DataTypes.STRING },
        verified: { type: DataTypes.DATE },
        resetToken: { type: DataTypes.STRING },
        resetTokenExpires: { type: DataTypes.DATE },
        passwordReset: { type: DataTypes.DATE },
        picUrl: { type: DataTypes.STRING, defaultValue:'' },
        dreamCoins: { 
            type: DataTypes.VIRTUAL,
             get() {
                return this.dreamCoin?.get().balance;
            }
        },
        mobileNumber: { type: DataTypes.STRING, allowNull: false },
        nationality: { type: DataTypes.STRING, allowNull: false },
        countryResidence: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, defaultValue:'' },
        verificationCodeSms: { type: DataTypes.STRING },
        referralCode: { type: DataTypes.STRING },


        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        isVerified: {
            type: DataTypes.VIRTUAL,
            get() { return !!(this.verified || this.passwordReset); }
        }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
        defaultScope: {
            // exclude password hash by default
            attributes: { exclude: ['passwordHash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }        
    };

    return sequelize.define('account', attributes, options);
}