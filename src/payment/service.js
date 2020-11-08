const crypto = require('crypto');
const AuthorizationException = require('../common/exceptions/AuthorizationException');
const Payment = require('./models/payment');
const Order = require("../order/models/order");
const Customer = require("../common/models/customer");

const host = process.env.URL;
const merchantId = process.env.MERCHANT_ID;
const hashKey = process.env.HASH_KEY;
const hashIV = process.env.HASH_IV;

const ePaymentGateway = 'https://ccore.spgateway.com/MPG/mpg_gateway';
const returnURL = host + '/payments/:paymentId/trade/return-callback';
const notifyURL = host + '/payments/:paymentId/trade/notify-callback';
const clientURL = host + '/payments/:paymentId/trade/client-callback';


class TradeService {

    /**
     * @param {Customer} user
     */
    constructor(user) {
        this.user = user;
    }

    async GetTradeInfo(paymentId) {
        const payment = await findPaymentWithRelations(paymentId);

        // @todo validate the payment record belongs to the user
        // if (!payment || payment.order.customer.id !== this.user.id) {
        //     throw AuthorizationException();
        // }

        return buildTradeInfo(payment);
    }

    async HandleCallback(paymentId, encryptedTradeResult) {
        try {
            const tradeResult = JSON.parse(decryptTradeInfo(encryptedTradeResult.TradeInfo));

            const payment = await findPaymentWithRelations(paymentId);

            let paymentStatus = 4;
            let orderStatus = 0;
            if (tradeResult.Status === 'SUCCESS') {
                paymentStatus = 2;
                orderStatus = 1;
            }
            await payment.update({
                status: paymentStatus,
                paidTime: new Date(),
                note: JSON.stringify(tradeResult)
            });
            await payment.order.update({
                status: orderStatus,
            });
        } catch (e) {
            console.log(e);
            throw new AuthorizationException();
        }
    }
}

/**
 * @param {Number} paymentId
 * @returns {Promise<Payment>}
 */
async function findPaymentWithRelations(paymentId) {
    return await Payment.findByPk(paymentId, {
        include: {
            model: Order,
            as: 'order',
            include: {
                model: Customer,
                as: 'customer'
            }
        }
    });
}

/**
 * @param {Object} object
 * @returns {string}
 */
function buildQuery(object) {
    return Object.keys(object)
        .map(k => k + '=' + object[k])
        .join('&');
}

/**
 * @param {string} encryptedTradeInfo
 * @returns {string}
 */
function decryptTradeInfo(encryptedTradeInfo) {
    const decipher = crypto.createDecipheriv('aes256', hashKey, hashIV);
    decipher.setAutoPadding(false);
    const decrypted = decipher.update(encryptedTradeInfo, 'hex', 'utf8') +
        decipher.final('utf8');

    return decrypted.toString().replace(/[\x00-\x20]+/g, '');
}

/**
 * Encrypt trade info by AES
 * @returns {string}
 * @param {Object} tradeInfo
 */
function buildEncryptedTradeInfo(tradeInfo) {
    const cipher = crypto.createCipheriv('aes256', hashKey, hashIV);
    const enc = cipher.update(buildQuery(tradeInfo), 'utf8', 'hex');
    return enc + cipher.final('hex');
}

/**
 * Encrypt encrypted trade info by SHA256
 * @returns {string}
 * @param {string} encryptedTradeInfo
 */
function buildTradeSha(encryptedTradeInfo) {
    const sha = crypto.createHash('sha256');
    const plainText = `HashKey=${hashKey}&${encryptedTradeInfo}&HashIV=${hashIV}`;

    return sha
        .update(plainText)
        .digest('hex')
        .toUpperCase();
}

/**
 * @param {Payment} payment
 * @returns Object
 */
function buildTradeInfo(payment) {
    // @todo use `payment.order.orderNumber`
    const orderNo = Date.now()

    const toBeEncrypted = {
        MerchantID: merchantId,
        RespondType: 'JSON',
        TimeStamp: Date.now(),
        Version: 1.5,
        MerchantOrderNo: orderNo,
        LoginType: 0,
        OrderComment: '',
        Amt: payment.order.amount,
        // @todo define the item name in payment page
        ItemDesc: 'Needs 平台商品',
        Email: payment.order.customer.email,
        ReturnURL: returnURL.replace(':paymentId', payment.id),
        NotifyURL: notifyURL.replace(':paymentId', payment.id),
        ClientBackURL: clientURL.replace(':paymentId', payment.id),
        // @todo use different payment way by our payment type
        CREDIT: 1,
        WEBATM: 0,
        VACC: 0,
        CVS: 0,
        BARCODE: 0,
    };

    const mpgAesEncrypt = buildEncryptedTradeInfo(toBeEncrypted);
    const mpgShaEncrypt = buildTradeSha(mpgAesEncrypt);

    return {
        merchantID: merchantId,
        tradeInfo: mpgAesEncrypt,
        tradeSha: mpgShaEncrypt,
        version: 1.5,
        payGateWay: ePaymentGateway,
        merchantOrderNo: orderNo
    };
}

module.exports = TradeService;
