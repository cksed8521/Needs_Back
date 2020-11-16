const {DataTypes, Model} = require('sequelize');
const sequelize = require('./connection');
const Order = require('../../order/models/order');

class Customer extends Model {
}

Customer.init({
    customerId: DataTypes.STRING,
    name: DataTypes.STRING,
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: DataTypes.STRING,
    email: DataTypes.STRING,
}, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    underscored: true,
    timestamps: false,
});

module.exports = Customer;
