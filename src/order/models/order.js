const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../common/models/connection');
const Payment = require("../../payment/models/payment");
const Customer = require("../../common/models/customer");

class Order extends Model {
}

Order.init({
    merchantId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
    orderNumber: DataTypes.STRING,
    deliveryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    paymentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    eDiscountLogId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    discount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    amount: DataTypes.DOUBLE,
    eBonusLogId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: DataTypes.TINYINT,
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    underscored: true,
});

Order.belongsTo(Customer,{as: 'customer', foreignKey: 'id'})

module.exports = Order;
