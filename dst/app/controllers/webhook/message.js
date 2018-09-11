"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * LINE Webhook messageコントローラー
 */
const cinerinoapi = require("@cinerino/api-nodejs-client");
const createDebug = require("debug");
const moment = require("moment");
const querystring = require("qs");
const lineClient_1 = require("../../../lineClient");
const debug = createDebug('cinerino-line-ticket:controllers');
/**
 * 使い方を送信する
 */
function pushHowToUse(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            type: 'text',
            text: 'ご用件はなんでしょう？',
            quickReply: {
                items: [
                    {
                        type: 'action',
                        imageUrl: `https://${params.user.host}/img/labels/reservation-ticket.png`,
                        action: {
                            type: 'message',
                            label: '座席予約管理',
                            text: '座席予約'
                        }
                    },
                    {
                        type: 'action',
                        imageUrl: `https://${params.user.host}/img/labels/credit-card-64.png`,
                        action: {
                            type: 'message',
                            label: 'クレジットカード管理',
                            text: 'クレジットカード'
                        }
                    },
                    {
                        type: 'action',
                        imageUrl: `https://${params.user.host}/img/labels/coin-64.png`,
                        action: {
                            type: 'message',
                            label: 'コイン口座管理',
                            text: 'コイン'
                        }
                    },
                    {
                        type: 'action',
                        imageUrl: `https://${params.user.host}/img/labels/order-96.png`,
                        action: {
                            type: 'message',
                            label: '注文管理',
                            text: '注文'
                        }
                    },
                    {
                        type: 'action',
                        imageUrl: `https://${params.user.host}/img/labels/qr-code-48.png`,
                        action: {
                            type: 'message',
                            label: 'コード管理',
                            text: 'コード'
                        }
                    },
                    {
                        type: 'action',
                        imageUrl: `https://${params.user.host}/img/labels/friend-pay-50.png`,
                        action: {
                            type: 'message',
                            label: 'おこづかいをもらう',
                            text: 'おこづかい'
                        }
                    }
                ]
            }
        };
        yield lineClient_1.default.replyMessage(params.replyToken, [message]);
    });
}
exports.pushHowToUse = pushHowToUse;
/**
 * 座席予約メニューを表示する
 */
function showSeatReservationMenu(replyToken) {
    return __awaiter(this, void 0, void 0, function* () {
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: '座席予約メニュー',
                template: {
                    type: 'buttons',
                    title: '座席予約',
                    text: 'ご用件はなんでしょう？',
                    actions: [
                        {
                            type: 'postback',
                            label: '座席を予約する',
                            data: `action=askEventStartDate`
                        },
                        {
                            type: 'postback',
                            label: '予約を確認する',
                            data: `action=searchScreeningEventReservations`
                        }
                    ]
                }
            }
        ]);
    });
}
exports.showSeatReservationMenu = showSeatReservationMenu;
/**
 * 注文メニューを表示する
 */
function showOrderMenu(replyToken) {
    return __awaiter(this, void 0, void 0, function* () {
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: '注文メニュー',
                template: {
                    type: 'buttons',
                    title: '注文',
                    text: 'ご用件はなんでしょう？',
                    actions: [
                        {
                            type: 'postback',
                            label: '注文を確認する',
                            data: `action=searchOrders`
                        }
                    ]
                }
            }
        ]);
    });
}
exports.showOrderMenu = showOrderMenu;
function showCreditCardMenu(replyToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputCreditCardUri = '/transactions/inputCreditCard?gmoShopId=tshop00026096';
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'クレジットカード管理',
                template: {
                    type: 'buttons',
                    title: 'クレジットカード管理',
                    text: 'ご用件はなんでしょう？',
                    actions: [
                        {
                            type: 'uri',
                            label: 'クレジットカード追加',
                            uri: `line://app/${process.env.LIFF_ID}?${querystring.stringify({ cb: inputCreditCardUri })}`
                        },
                        {
                            type: 'postback',
                            label: 'クレジットカード検索',
                            data: `action=searchCreditCards`
                        }
                    ]
                }
            }
        ]);
    });
}
exports.showCreditCardMenu = showCreditCardMenu;
function showCoinAccountMenu(replyToken, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const openAccountUri = `https://${user.host}/accounts/open?accountType=${cinerinoapi.factory.accountType.Coin}`;
        const liffUri = `line://app/${process.env.LIFF_ID}?${querystring.stringify({ cb: openAccountUri })}`;
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'コイン口座管理',
                template: {
                    type: 'buttons',
                    title: 'コイン口座管理',
                    text: 'ご用件はなんでしょう？',
                    actions: [
                        {
                            type: 'uri',
                            label: '口座開設',
                            uri: liffUri
                        },
                        {
                            type: 'postback',
                            label: '口座検索',
                            data: 'action=searchCoinAccounts'
                        }
                    ]
                }
            }
        ]);
    });
}
exports.showCoinAccountMenu = showCoinAccountMenu;
function showCodeMenu(replyToken, _) {
    return __awaiter(this, void 0, void 0, function* () {
        const scanQRUri = '/reservations/scanScreeningEventReservationCode';
        const liffUri = `line://app/${process.env.LIFF_ID}?${querystring.stringify({ cb: scanQRUri })}`;
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'コード管理',
                template: {
                    type: 'buttons',
                    title: 'コード管理',
                    text: 'ご用件はなんでしょう？',
                    actions: [
                        {
                            type: 'uri',
                            label: '座席予約チケット読み込み',
                            uri: liffUri
                        }
                    ]
                }
            }
        ]);
    });
}
exports.showCodeMenu = showCodeMenu;
/**
 * 顔写真登録を開始する
 */
function startIndexingFace(replyToken) {
    return __awaiter(this, void 0, void 0, function* () {
        yield lineClient_1.default.replyMessage(replyToken, { type: 'text', text: '顔写真を送信してください' });
    });
}
exports.startIndexingFace = startIndexingFace;
/**
 * 友達決済承認確認
 */
function askConfirmationOfFriendPay(replyToken, token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'This is a buttons template',
                template: {
                    type: 'confirm',
                    text: '本当に友達決済を承認しますか?',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Yes',
                            data: `action=confirmFriendPay&token=${token}`
                        },
                        {
                            type: 'postback',
                            label: 'No',
                            data: `action=rejectFriendPay&token=${token}`
                        }
                    ]
                }
            }
        ]);
    });
}
exports.askConfirmationOfFriendPay = askConfirmationOfFriendPay;
/**
 * おこづかい承認確認
 */
function askConfirmationOfTransferMoney(replyToken, user, transferMoneyToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const transferMoneyInfo = yield user.verifyTransferMoneyToken(transferMoneyToken);
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'おこづかい金額選択',
                template: {
                    type: 'buttons',
                    text: `${transferMoneyInfo.name}がおこづかいを要求しています`,
                    actions: [
                        {
                            type: 'postback',
                            label: '10円あげる',
                            data: `action=confirmTransferMoney&token=${transferMoneyToken}&price=10`
                        },
                        {
                            type: 'postback',
                            label: '100円あげる',
                            data: `action=confirmTransferMoney&token=${transferMoneyToken}&price=100`
                        },
                        {
                            type: 'postback',
                            label: '1000円あげる',
                            data: `action=confirmTransferMoney&token=${transferMoneyToken}&price=1000`
                        },
                        {
                            type: 'postback',
                            label: 'あげない',
                            data: `action=rejectTransferMoney&token=${transferMoneyToken}`
                        }
                    ]
                }
            }
        ]);
    });
}
exports.askConfirmationOfTransferMoney = askConfirmationOfTransferMoney;
/**
 * 誰からお金をもらうか選択する
 */
function selectWhomAskForMoney(replyToken, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const LINE_ID = process.env.LINE_ID;
        const personService = new cinerinoapi.service.Person({
            endpoint: process.env.CINERINO_ENDPOINT,
            auth: user.authClient
        });
        const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            endpoint: process.env.CINERINO_ENDPOINT,
            auth: user.authClient
        });
        const searchAccountsResult = yield personOwnershipInfoService.search({
            personId: 'me',
            typeOfGood: {
                typeOf: cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
                accountType: cinerinoapi.factory.accountType.Coin
            }
        });
        const accounts = searchAccountsResult.data
            .map((o) => o.typeOfGood)
            .filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
        debug('accounts:', accounts);
        if (accounts.length === 0) {
            throw new Error('口座未開設です');
        }
        const account = accounts[0];
        const contact = yield personService.getContacts({ personId: 'me' });
        const token = yield user.signTransferMoneyInfo({
            userId: user.userId,
            accountNumber: account.accountNumber,
            name: `${contact.familyName} ${contact.givenName}`
        });
        const friendMessage = `TransferMoneyToken.${token}`;
        const message = encodeURIComponent(`おこづかいちょーだい！
よければ下のリンクを押してそのままメッセージを送信してね
line://oaMessage/${LINE_ID}/?${friendMessage}`);
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'This is a buttons template',
                template: {
                    type: 'buttons',
                    title: 'おこづかいをもらう',
                    text: '友達を選択してメッセージを送信しましょう',
                    actions: [
                        {
                            type: 'uri',
                            label: '誰からもらう？',
                            uri: `line://msg/text/?${message}`
                        }
                    ]
                }
            }
        ]);
    });
}
exports.selectWhomAskForMoney = selectWhomAskForMoney;
/**
 * 予約番号or電話番号のボタンを送信する
 */
function pushButtonsReserveNumOrTel(replyToken, userId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(userId, message);
        const datas = message.split('-');
        const theater = datas[0];
        const reserveNumOrTel = datas[1];
        // キュー実行のボタン表示
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'aaa',
                template: {
                    type: 'buttons',
                    text: 'どちらで検索する？',
                    actions: [
                        {
                            type: 'postback',
                            label: '予約番号',
                            data: `action=searchTransactionByReserveNum&theater=${theater}&reserveNum=${reserveNumOrTel}`
                        },
                        {
                            type: 'postback',
                            label: '電話番号',
                            data: `action=searchTransactionByTel&theater=${theater}&tel=${reserveNumOrTel}`
                        }
                    ]
                }
            }
        ]);
    });
}
exports.pushButtonsReserveNumOrTel = pushButtonsReserveNumOrTel;
/**
 * 予約のイベント日選択を求める
 */
function askReservationEventDate(replyToken, paymentNo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: '日付選択',
                template: {
                    type: 'buttons',
                    text: 'ツアーの開演日を教えてください',
                    actions: [
                        {
                            type: 'datetimepicker',
                            label: '日付選択',
                            mode: 'date',
                            data: `action=searchTransactionByPaymentNo&paymentNo=${paymentNo}`,
                            initial: moment().format('YYYY-MM-DD')
                        }
                    ]
                }
            }
        ]);
    });
}
exports.askReservationEventDate = askReservationEventDate;
/**
 * 日付選択を求める
 */
function askEventStartDate(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            type: 'text',
            text: 'いつ見ますか？',
            quickReply: {
                items: [
                    {
                        type: 'action',
                        // imageUrl: `https://${user.host}/img/labels/coin-64.png`,
                        action: {
                            type: 'postback',
                            label: '今日',
                            data: querystring.stringify({
                                action: 'searchEventsByDate',
                                date: moment().add(0, 'days').format('YYYY-MM-DD')
                            })
                        }
                    },
                    {
                        type: 'action',
                        // imageUrl: `https://${user.host}/img/labels/friend-pay-64.png`,
                        action: {
                            type: 'postback',
                            label: '明日',
                            data: querystring.stringify({
                                action: 'searchEventsByDate',
                                date: moment().add(1, 'days').format('YYYY-MM-DD')
                            })
                        }
                    },
                    {
                        type: 'action',
                        // imageUrl: `https://${user.host}/img/labels/friend-pay-64.png`,
                        action: {
                            type: 'postback',
                            label: '明後日',
                            data: querystring.stringify({
                                action: 'searchEventsByDate',
                                // tslint:disable-next-line:no-magic-numbers
                                date: moment().add(2, 'days').format('YYYY-MM-DD')
                            })
                        }
                    },
                    {
                        type: 'action',
                        imageUrl: `https://${params.user.host}/img/labels/calender-48.png`,
                        action: {
                            type: 'datetimepicker',
                            label: '選ぶ',
                            mode: 'date',
                            data: 'action=searchEventsByDate',
                            initial: moment().add(1, 'days').format('YYYY-MM-DD'),
                            // tslint:disable-next-line:no-magic-numbers
                            max: moment().add(7, 'days').format('YYYY-MM-DD'),
                            min: moment().add(1, 'days').format('YYYY-MM-DD')
                        }
                    }
                ]
            }
        };
        yield lineClient_1.default.replyMessage(params.replyToken, [message]);
    });
}
exports.askEventStartDate = askEventStartDate;
/**
 * 日付選択を求める
 */
function askFromWhenAndToWhen(replyToken) {
    return __awaiter(this, void 0, void 0, function* () {
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: '日付選択',
                template: {
                    type: 'buttons',
                    text: '日付を選択するか、期間をYYYYMMDD-YYYYMMDD形式で教えてください',
                    actions: [
                        {
                            type: 'datetimepicker',
                            label: '日付選択',
                            mode: 'date',
                            data: 'action=searchTransactionsByDate',
                            initial: moment().format('YYYY-MM-DD')
                        }
                    ]
                }
            }
        ]);
    });
}
exports.askFromWhenAndToWhen = askFromWhenAndToWhen;
function logout(replyToken, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const logoutUri = `https://${user.host}/logout?userId=${user.userId}`;
        const liffUri = `line://app/${process.env.LIFF_ID}?${querystring.stringify({ cb: logoutUri })}`;
        yield lineClient_1.default.replyMessage(replyToken, [
            {
                type: 'template',
                altText: 'ログアウトボタン',
                template: {
                    type: 'buttons',
                    text: '本当にログアウトしますか？',
                    actions: [
                        {
                            type: 'uri',
                            label: 'Log out',
                            uri: liffUri
                        }
                    ]
                }
            }
        ]);
    });
}
exports.logout = logout;
