require('dotenv').config();

const HttpException = require('../common/exceptions/HttpException');
const TradeService = require('./service');

const controller = {
    GetTradeInfo: async (req, res) => {
        const paymentId = req.params.paymentId;
        // @todo pass the real user
        const service = new TradeService(undefined)
        try {
            return res.json(await service.GetTradeInfo(paymentId));
        } catch (error) {
            console.log('getPayment error', error);
            res.sendStatus(500);
        }
    },
    HandleReturnCallback: async (req, res) => {
        const tradeResult = req.body;
        // @todo pass the real user
        const service = new TradeService(undefined)
        try {
            await service.HandleCallback(req.params.paymentId, tradeResult);
            return res.redirect(process.env.URL + `/payments/${req.params.paymentId}/trade/client-callback`);
        } catch (e) {
            console.log(e);
            if (e instanceof HttpException) {
                return res.status(e.GetCode()).json(e.GetResponse());
            }
            return res.sendStatus(500);
        }
    },
    handleNotifyCallback: async (req, res) => {
        const tradeResult = req.body;
        // @todo pass the real user
        const service = new TradeService(undefined)
        try {
            await service.HandleCallback(req.params.paymentId, tradeResult)
            return res.json({result: true});
        } catch (e) {
            console.log(e);
            if (e instanceof HttpException) {
                return res.status(e.GetCode()).json(e.GetResponse());
            }
            return res.sendStatus(500);
        }
    },
    handleClientCallback: async (req, res) => {
        res.json("handleClientCallback");
    }
};

module.exports = controller;