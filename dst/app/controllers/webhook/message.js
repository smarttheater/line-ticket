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
 * LINE webhook messageコントローラー
 */
const cinerinoapi = require("@cinerino/api-nodejs-client");
const createDebug = require("debug");
const moment = require("moment");
const request = require("request-promise-native");
const querystring = require("querystring");
const util = require("util");
const LINE = require("../../../line");
const debug = createDebug('cinerino-line-ticket:controller:webhook:message');
/**
 * 使い方を送信する
 */
function pushHowToUse(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId,
                messages: [
                    {
                        type: 'template',
                        altText: 'How to use',
                        template: {
                            type: 'buttons',
                            title: '何をしますか？',
                            text: '画面下部メニューから操作することもできます。',
                            actions: [
                                {
                                    type: 'message',
                                    label: '座席予約メニューを見る',
                                    text: '座席予約'
                                },
                                {
                                    type: 'message',
                                    label: '口座を確認する',
                                    text: '口座残高'
                                },
                                {
                                    type: 'message',
                                    label: 'おこづかいをもらう',
                                    text: 'おこづかい'
                                },
                                {
                                    type: 'message',
                                    label: '顔を登録する',
                                    text: '顔写真登録'
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.pushHowToUse = pushHowToUse;
/**
 * 座席予約メニューを表示する
 */
function showSeatReservationMenu(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
                    {
                        type: 'template',
                        altText: '座席予約メニュー',
                        template: {
                            type: 'buttons',
                            title: '座席予約',
                            text: 'ご用件はなんでしょう？',
                            actions: [
                                {
                                    type: 'message',
                                    label: '座席を予約する',
                                    text: '座席予約追加'
                                },
                                {
                                    type: 'message',
                                    label: '予約を確認する',
                                    text: 'チケット'
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.showSeatReservationMenu = showSeatReservationMenu;
function showCreditCardMenu(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
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
                                    uri: `line://app/${process.env.LIFF_ID}?${querystring.stringify({ cb: '/transactions/inputCreditCard' })}`
                                },
                                {
                                    type: 'message',
                                    label: 'クレジットカード検索',
                                    text: 'クレジットカード検索'
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.showCreditCardMenu = showCreditCardMenu;
function showCoinAccountMenu(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
                    {
                        type: 'template',
                        altText: 'コイン口座管理',
                        template: {
                            type: 'buttons',
                            title: 'コイン口座管理',
                            text: 'ご用件はなんでしょう？',
                            actions: [
                                {
                                    type: 'message',
                                    label: 'コイン口座追加',
                                    text: 'コイン口座追加'
                                },
                                {
                                    type: 'message',
                                    label: 'コイン口座検索',
                                    text: 'コイン口座検索'
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.showCoinAccountMenu = showCoinAccountMenu;
function addCreditCard(user) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(user);
    });
}
exports.addCreditCard = addCreditCard;
/**
 * 顔写真登録を開始する
 */
function startIndexingFace(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const text = '顔写真を送信してください。';
        yield LINE.pushMessage(userId, text);
    });
}
exports.startIndexingFace = startIndexingFace;
/**
 * 友達決済承認確認
 */
function askConfirmationOfFriendPay(user, token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
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
                ]
            }
        }).promise();
    });
}
exports.askConfirmationOfFriendPay = askConfirmationOfFriendPay;
/**
 * おこづかい承認確認
 */
function askConfirmationOfTransferMoney(user, transferMoneyToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const transferMoneyInfo = yield user.verifyTransferMoneyToken(transferMoneyToken);
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
                    {
                        type: 'template',
                        altText: 'おこづかい金額選択',
                        template: {
                            type: 'buttons',
                            text: `${transferMoneyInfo.name}がおこづかいを要求しています。どのくらいあげますか？`,
                            actions: [
                                {
                                    type: 'postback',
                                    label: '10',
                                    data: `action=confirmTransferMoney&token=${transferMoneyToken}&price=10`
                                },
                                {
                                    type: 'postback',
                                    label: '100',
                                    data: `action=confirmTransferMoney&token=${transferMoneyToken}&price=100`
                                },
                                {
                                    type: 'postback',
                                    label: '1000',
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
                ]
            }
        }).promise();
    });
}
exports.askConfirmationOfTransferMoney = askConfirmationOfTransferMoney;
/**
 * 誰からお金をもらうか選択する
 */
function selectWhomAskForMoney(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const LINE_ID = process.env.LINE_ID;
        const personService = new cinerinoapi.service.Person({
            endpoint: process.env.CINERINO_ENDPOINT,
            auth: user.authClient
        });
        let accounts = yield personService.searchAccounts({ personId: 'me', accountType: cinerinoapi.factory.accountType.Coin })
            .then((ownershiInfos) => ownershiInfos.map((o) => o.typeOfGood));
        accounts = accounts.filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
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
よければ下のリンクを押してそのままメッセージを送信してね。
line://oaMessage/${LINE_ID}/?${friendMessage}`);
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
                    {
                        type: 'template',
                        altText: 'This is a buttons template',
                        template: {
                            type: 'buttons',
                            title: 'おこづかいをもらう',
                            text: '友達を選択してメッセージを送信しましょう。',
                            actions: [
                                {
                                    type: 'uri',
                                    label: '誰からもらう？',
                                    uri: `line://msg/text/?${message}`
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.selectWhomAskForMoney = selectWhomAskForMoney;
/**
 * 予約番号or電話番号のボタンを送信する
 */
function pushButtonsReserveNumOrTel(userId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(userId, message);
        const datas = message.split('-');
        const theater = datas[0];
        const reserveNumOrTel = datas[1];
        // キュー実行のボタン表示
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId,
                messages: [
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
                ]
            }
        }).promise();
    });
}
exports.pushButtonsReserveNumOrTel = pushButtonsReserveNumOrTel;
/**
 * 予約のイベント日選択を求める
 */
function askReservationEventDate(userId, paymentNo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post('https://api.line.me/v2/bot/message/push', {
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId,
                messages: [
                    {
                        type: 'template',
                        altText: '日付選択',
                        template: {
                            type: 'buttons',
                            text: 'ツアーの開演日を教えてください。',
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
                ]
            }
        }).promise();
    });
}
exports.askReservationEventDate = askReservationEventDate;
/**
 * ユーザーのチケット(座席予約)を検索する
 */
function searchTickets(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield LINE.pushMessage(user.userId, '座席予約を検索しています...');
        const personService = new cinerinoapi.service.Person({
            endpoint: process.env.CINERINO_ENDPOINT,
            auth: user.authClient
        });
        const ownershipInfos = yield personService.searchScreeningEventReservations({
            // goodType: cinerinoapi.factory.reservationType.EventReservation,
            personId: 'me'
        });
        debug(ownershipInfos.length, 'ownershipInfos found.');
        if (ownershipInfos.length === 0) {
            yield LINE.pushMessage(user.userId, '座席予約が見つかりませんでした。');
        }
        else {
            yield request.post({
                simple: false,
                url: 'https://api.line.me/v2/bot/message/push',
                auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
                json: true,
                body: {
                    to: user.userId,
                    messages: [
                        {
                            type: 'template',
                            altText: '座席予約チケット',
                            template: {
                                type: 'carousel',
                                columns: ownershipInfos.map((ownershipInfo) => {
                                    const itemOffered = ownershipInfo.typeOfGood;
                                    // tslint:disable-next-line:max-line-length
                                    const qr = `https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=${itemOffered.reservedTicket.ticketToken}`;
                                    const text = util.format('%s-\n@%s\n%s', moment(itemOffered.reservationFor.startDate).format('YYYY-MM-DD HH:mm'), 
                                    // tslint:disable-next-line:max-line-length
                                    `${itemOffered.reservationFor.superEvent.location.name.ja}`, 
                                    // tslint:disable-next-line:max-line-length
                                    `${itemOffered.reservedTicket.ticketedSeat.seatNumber} ${itemOffered.reservedTicket.ticketType.name.ja}`);
                                    return {
                                        thumbnailImageUrl: qr,
                                        // imageBackgroundColor: '#000000',
                                        title: itemOffered.reservationFor.name.ja,
                                        text: text,
                                        actions: [
                                            {
                                                type: 'postback',
                                                label: '飲食を注文する',
                                                data: `action=orderMenuItems&ticketToken=${itemOffered.reservedTicket.ticketToken}`
                                            }
                                        ]
                                    };
                                }),
                                imageAspectRatio: 'square'
                                // imageAspectRatio: 'rectangle',
                                // imageSize: 'cover'
                            }
                        }
                    ]
                }
            }).promise();
        }
    });
}
exports.searchTickets = searchTickets;
function findAccount(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const personService = new cinerinoapi.service.Person({
            endpoint: process.env.CINERINO_ENDPOINT,
            auth: user.authClient
        });
        let accounts = yield personService.searchAccounts({ personId: 'me', accountType: cinerinoapi.factory.accountType.Coin })
            .then((ownershiInfos) => ownershiInfos.map((o) => o.typeOfGood));
        accounts = accounts.filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
        debug('accounts:', accounts);
        if (accounts.length === 0) {
            throw new Error('口座未開設です');
        }
        const account = accounts[0];
        const text = util.format('口座番号: %s\n残高: %s\n引出可能残高: %s', account.accountNumber, account.balance.toLocaleString('ja'), account.availableBalance.toLocaleString('ja'));
        yield request.post({
            simple: false,
            url: 'https://api.line.me/v2/bot/message/push',
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
                    {
                        type: 'template',
                        altText: '口座確認',
                        template: {
                            type: 'buttons',
                            title: '口座',
                            text: text,
                            actions: [
                                {
                                    type: 'message',
                                    label: '取引履歴を確認する',
                                    text: '口座取引履歴'
                                },
                                {
                                    type: 'message',
                                    label: 'おこづかいをもらう',
                                    text: 'おこづかい'
                                },
                                {
                                    type: 'postback',
                                    label: 'クレカから入金する',
                                    data: 'action=depositFromCreditCard'
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.findAccount = findAccount;
function searchAccountTradeActions(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const personService = new cinerinoapi.service.Person({
            endpoint: process.env.CINERINO_ENDPOINT,
            auth: user.authClient
        });
        let accounts = yield personService.searchAccounts({ personId: 'me', accountType: cinerinoapi.factory.accountType.Coin })
            .then((ownershiInfos) => ownershiInfos.map((o) => o.typeOfGood));
        accounts = accounts.filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
        debug('accounts:', accounts);
        if (accounts.length === 0) {
            throw new Error('口座未開設です');
        }
        const account = accounts[0];
        let transferActions = yield personService.searchAccountMoneyTransferActions({
            personId: 'me',
            accountType: cinerinoapi.factory.accountType.Coin,
            accountNumber: account.accountNumber
        });
        if (transferActions.length === 0) {
            yield LINE.pushMessage(user.userId, 'まだ取引履歴はありません。');
            return;
        }
        // tslint:disable-next-line:no-magic-numbers
        transferActions = transferActions.slice(0, 10);
        const actionsStr = transferActions.map((a) => {
            let actionName = '';
            switch (a.purpose.typeOf) {
                case cinerinoapi.factory.pecorino.transactionType.Withdraw:
                    actionName = '支払';
                    break;
                case cinerinoapi.factory.pecorino.transactionType.Transfer:
                    actionName = '転送';
                    break;
                case cinerinoapi.factory.pecorino.transactionType.Deposit:
                    actionName = '入金';
                    break;
                default:
            }
            return util.format('●%s %s %s %s\n⇐ %s\n[%s]\n⇒ %s\n[%s]\n@%s', (a.fromLocation.accountNumber === account.accountNumber) ? '出' : '入', moment(a.endDate).format('YY.MM.DD HH:mm'), actionName, `${a.amount}P`, a.fromLocation.name, (a.fromLocation.accountNumber !== undefined) ? a.fromLocation.accountNumber : '', a.toLocation.name, (a.toLocation.accountNumber !== undefined) ? a.toLocation.accountNumber : '', (a.description !== undefined) ? a.description : '');
        }).join('\n');
        yield LINE.pushMessage(user.userId, actionsStr);
    });
}
exports.searchAccountTradeActions = searchAccountTradeActions;
/**
 * 日付選択を求める
 */
function askEventStartDate(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post('https://api.line.me/v2/bot/message/push', {
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId,
                messages: [
                    {
                        type: 'template',
                        altText: '日付選択',
                        template: {
                            type: 'buttons',
                            text: '上映日は？',
                            actions: [
                                {
                                    type: 'datetimepicker',
                                    label: '日付選択',
                                    mode: 'date',
                                    data: 'action=searchEventsByDate',
                                    initial: moment().add(1, 'days').format('YYYY-MM-DD'),
                                    // tslint:disable-next-line:no-magic-numbers
                                    max: moment().add(2, 'days').format('YYYY-MM-DD'),
                                    min: moment().add(1, 'days').format('YYYY-MM-DD')
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.askEventStartDate = askEventStartDate;
/**
 * 日付選択を求める
 */
function askFromWhenAndToWhen(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // await LINE.pushMessage(userId, '期間をYYYYMMDD-YYYYMMDD形式で教えてください。');
        yield request.post('https://api.line.me/v2/bot/message/push', {
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId,
                messages: [
                    {
                        type: 'template',
                        altText: '日付選択',
                        template: {
                            type: 'buttons',
                            text: '日付を選択するか、期間をYYYYMMDD-YYYYMMDD形式で教えてください。',
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
                ]
            }
        }).promise();
    });
}
exports.askFromWhenAndToWhen = askFromWhenAndToWhen;
function logout(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield request.post({
            simple: false,
            url: LINE.URL_PUSH_MESSAGE,
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: user.userId,
                messages: [
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
                                    uri: `https://${user.host}/logout?userId=${user.userId}`
                                }
                            ]
                        }
                    }
                ]
            }
        }).promise();
    });
}
exports.logout = logout;
