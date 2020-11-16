const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../common/models/connection");
const Order = require("../../order/models/order");

class Payment extends Model {}

Payment.init(
  {
    type: DataTypes.TINYINT,
    status: DataTypes.TINYINT,
    paidTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    atmVirtualAccount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    atmExpiredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "order_payments",
    underscored: true,
  }
);

Payment.belongsTo(Order, {
  as: "order",
  foreignKey: "id",
  targetKey: "paymentId",
});

module.exports = Payment;
