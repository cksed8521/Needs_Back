const express = require("express");
const router = express.Router();
const controller = require('./controller');

router.get('/:paymentId/trade/info', controller.GetTradeInfo);
router.post('/:paymentId/trade/return-callback', controller.HandleReturnCallback);
router.post('/:paymentId/trade/notify-callback', controller.handleNotifyCallback);
router.get('/:paymentId/trade/client-callback', controller.handleClientCallback);

module.exports = router;
