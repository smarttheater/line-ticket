"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const lineClient_1 = require("../../lineClient");
const WebhookController = require("../controllers/webhook");
const authentication_1 = require("../middlewares/authentication");
const faceLogin_1 = require("../middlewares/faceLogin");
const webhookRouter = express.Router();
const debug = createDebug('cinerino-line-ticket:router');
webhookRouter.post('', faceLogin_1.default, authentication_1.default, 
// line.middleware(config),
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    debug('body:', req.body);
    yield Promise.all(req.body.events.map((e) => __awaiter(void 0, void 0, void 0, function* () {
        yield handleEvent(e, req.user);
    })));
    res.status(http_status_1.OK)
        .send('ok');
}));
function handleEvent(event, user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            switch (event.type) {
                case 'message':
                    yield WebhookController.message(event, user);
                    break;
                case 'postback':
                    yield WebhookController.postback(event, user);
                    break;
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore next */
                case 'follow':
                    yield WebhookController.follow(event);
                    break;
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore next */
                case 'unfollow':
                    yield WebhookController.unfollow(event);
                    break;
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore next */
                case 'join':
                    yield WebhookController.join(event);
                    break;
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore next */
                case 'leave':
                    yield WebhookController.leave(event);
                    break;
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore next */
                case 'beacon':
                    yield WebhookController.beacon(event);
                    break;
                default:
            }
        }
        catch (error) {
            debug(error);
            yield lineClient_1.default.pushMessage(user.userId, { type: 'text', text: `${error.name}:${error.message}` });
        }
    });
}
exports.default = webhookRouter;
