"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * defaultルーター
 */
const express = require("express");
const auth_1 = require("./auth");
const liff_1 = require("./liff");
const transactions_1 = require("./transactions");
const router = express.Router();
// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })
router.use(auth_1.default);
router.use('/liff', liff_1.default);
router.use(transactions_1.default);
exports.default = router;
