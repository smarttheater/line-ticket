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
exports.PostbackWebhookController = void 0;
const cinerinoapi = require("@cinerino/sdk");
const createDebug = require("debug");
const moment = require("moment");
const qs = require("qs");
// import { format } from 'util';
const lineClient_1 = require("../../../lineClient");
const coin_1 = require("../account/coin");
const contentsBuilder_1 = require("../../contentsBuilder");
const debug = createDebug('cinerino-line-ticket:controllers');
/**
 * ポストバックウェブフックコントローラ
 */
class PostbackWebhookController {
    constructor(req) {
        this.req = req;
        this.project = req.project;
        this.user = req.user;
    }
    /**
     * 日付でイベント検索
     * @params.date {string} date YYYY-MM-DD形式
     */
    searchEventsByDate(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `${params.date}のイベントを検索しています...` });
            const eventService = new cinerinoapi.service.Event({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchScreeningEventsResult = yield eventService.search({
                typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent,
                eventStatuses: [cinerinoapi.factory.chevre.eventStatusType.EventScheduled],
                inSessionFrom: moment.unix(Math.max(moment(`${params.date}T00:00:00+09:00`)
                    .unix(), moment()
                    .unix()))
                    .toDate(),
                inSessionThrough: moment(`${params.date}T00:00:00+09:00`)
                    .add(1, 'day')
                    .toDate()
            });
            const screeningEvents = searchScreeningEventsResult.data;
            // 上映イベントシリーズをユニークに
            let superEvents = screeningEvents.map((e) => e.superEvent);
            superEvents = superEvents.filter((e, index, events) => events.map((e2) => e2.id)
                .indexOf(e.id) === index);
            // tslint:disable-next-line:no-magic-numbers
            superEvents = superEvents.slice(0, 10);
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${superEvents.length}件の作品がみつかりました` });
            if (superEvents.length === 0) {
                // 日付を再選択
                yield this.askEventStartDate({
                    replyToken: params.replyToken,
                    text: '他の日付はいかがでしょうか？'
                });
                return;
            }
            // const accessToken = await params.user.authClient.getAccessToken();
            const flex = {
                type: 'flex',
                altText: 'This is a Flex Message',
                contents: {
                    type: 'carousel',
                    contents: [
                        // tslint:disable-next-line:no-magic-numbers
                        ...superEvents.slice(0, 10)
                            .map((event) => {
                            return contentsBuilder_1.screeningEventSeries2flexBubble({ date: params.date, event: event });
                        })
                    ]
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
        });
    }
    /**
     * 上映イベントスケジュールをたずねる
     */
    askScreeningEvent(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `${params.date}のイベントを検索しています...` });
            const eventService = new cinerinoapi.service.Event({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const startFrom = moment.unix(Math.max(moment(`${params.date}T00:00:00+09:00`)
                .unix(), moment()
                .unix()))
                .toDate();
            const startThrough = moment(`${params.date}T00:00:00+09:00`)
                .add(1, 'day')
                .toDate();
            const searchScreeningEventsResult = yield eventService.search({
                typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent,
                eventStatuses: [cinerinoapi.factory.chevre.eventStatusType.EventScheduled],
                inSessionFrom: startFrom,
                inSessionThrough: startThrough
            });
            let screeningEvents = searchScreeningEventsResult.data;
            // 上映イベントシリーズをユニークに
            screeningEvents = screeningEvents
                .filter((e) => e.superEvent.id === params.screeningEventSeriesId)
                // tslint:disable-next-line:no-magic-numbers
                .slice(0, 10);
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${screeningEvents.length}件のスケジュールがみつかりました` });
            const bubbles = screeningEvents.map((event) => {
                return contentsBuilder_1.screeningEvent2flexBubble({ event: event, user: this.user });
            });
            yield lineClient_1.default.pushMessage(this.user.userId, [
                {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'carousel',
                        contents: bubbles
                    }
                }
            ]);
        });
    }
    /**
     * メンバーシップサービスを検索する
     */
    searchMembershipServices(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: 'プロダクトを検索しています...' });
            const productService = new cinerinoapi.service.Product({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchProductsResult = yield productService.search({
                typeOf: { $eq: 'MembershipService' }
            });
            let products = searchProductsResult.data;
            // tslint:disable-next-line:no-magic-numbers
            products = products.slice(0, 10);
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${products.length}件のプロダクトがみつかりました` });
            const bubbles = products.map((product) => {
                // api仕様上必須なので、いったん固定で
                return contentsBuilder_1.product2flexBubble({ product, user: this.user, accessCode: '1234' });
            });
            yield lineClient_1.default.pushMessage(this.user.userId, [
                {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'carousel',
                        contents: bubbles
                    }
                }
            ]);
        });
    }
    /**
     * 決済コードをたずねる
     */
    askPaymentCode(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            //     const LINE_ID = process.env.LINE_ID;
            //     const token = await user.signFriendPayInfo({
            //         transactionId: transaction.id,
            //         userId: params.user.userId,
            //         price: (<cinerino.factory.action.authorize.offer.seatReservation.IResult>seatReservationAuthorization.result).price
            //     });
            //     const friendMessage = `FriendPayToken.${token}`;
            //     const message = encodeURIComponent(`僕の代わりに決済をお願いできますか？よければ、下のリンクを押してそのままメッセージを送信してください
            // line://oaMessage/${LINE_ID}/?${friendMessage}`);
            const scanQRUri = `/projects/${(_a = this.project) === null || _a === void 0 ? void 0 : _a.id}/transactions/placeOrder/scanQRCode?transactionId=${params.transactionId}`;
            const liffUri = `line://app/${process.env.LIFF_ID}?${qs.stringify({ cb: scanQRUri })}`;
            yield lineClient_1.default.replyMessage(params.replyToken, [
                {
                    type: 'template',
                    altText: '決済コード',
                    template: {
                        type: 'buttons',
                        title: '決済コード',
                        text: '決済コードを入力してください',
                        actions: [
                            {
                                type: 'uri',
                                label: 'QRコードを読み取る',
                                uri: liffUri
                            }
                        ]
                    }
                }
            ]);
        });
    }
    /**
     * 決済方法選択
     */
    // tslint:disable-next-line:max-func-body-length
    selectPaymentMethodType(params) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const personService = new cinerinoapi.service.Person({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            // const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: this.user.authClient,
            //     project: { id: this.project?.id }
            // });
            const paymentService = new cinerinoapi.service.Payment({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
            });
            // const ownershipInfoService = new cinerinoapi.service.OwnershipInfo({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: this.user.authClient,
            //     project: { id: this.project?.id }
            // });
            const price = params.amount;
            // 金額が0であれば決済不要
            if (price > 0) {
                switch (params.paymentMethodType) {
                    case 'PaymentCard':
                        // let account: cinerinoapi.factory.pecorino.account.IAccount<string> | string;
                        // if (params.code === undefined) {
                        //     // 口座番号取得
                        //     const searchAccountsResult =
                        //         await personOwnershipInfoService.search<cinerinoapi.factory.ownershipInfo.AccountGoodType.Account>({
                        //             typeOfGood: {
                        //                 typeOf: cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
                        //                 accountType: cinerinoapi.factory.accountType.Prepaid
                        //             }
                        //         });
                        //     let accounts = searchAccountsResult.data.map((o) => o.typeOfGood);
                        //     accounts = accounts.filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
                        //     debug('accounts:', accounts);
                        //     if (accounts.length === 0) {
                        //         throw new Error('口座未開設です');
                        //     }
                        //     account = accounts[0];
                        // } else {
                        //     const { token } = await ownershipInfoService.getToken({ code: params.code });
                        //     account = token;
                        // }
                        const paymentCard = params.paymentCard;
                        if (paymentCard === undefined) {
                            throw new Error('ペイメントカードが指定されていません');
                        }
                        yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${JSON.stringify(paymentCard)}` });
                        yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${paymentCard.identifier}の残高を確認しています...` });
                        const accountAuthorization = yield paymentService.authorizePaymentCard({
                            object: {
                                typeOf: cinerinoapi.factory.action.authorize.paymentMethod.any.ResultType.Payment,
                                amount: price,
                                fromLocation: paymentCard,
                                paymentMethod: paymentCard.typeOf
                            },
                            purpose: { typeOf: cinerinoapi.factory.transactionType.PlaceOrder, id: params.transactionId }
                        });
                        debug('残高確認済', accountAuthorization);
                        yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '残高の確認がとれました' });
                        break;
                    case cinerinoapi.factory.paymentMethodType.CreditCard:
                        yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${JSON.stringify(params.creditCard)}` });
                        yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: 'クレジットカードを確認しています...' });
                        if (params.creditCard === undefined) {
                            throw new Error('クレジットカードが指定されていません');
                        }
                        yield paymentService.authorizeCreditCard({
                            object: {
                                typeOf: cinerinoapi.factory.action.authorize.paymentMethod.any.ResultType.Payment,
                                name: 'クレカ',
                                amount: price,
                                method: '1',
                                paymentMethod: cinerinoapi.factory.chevre.paymentMethodType.CreditCard,
                                creditCard: params.creditCard
                            },
                            purpose: { typeOf: cinerinoapi.factory.transactionType.PlaceOrder, id: params.transactionId }
                        });
                        yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'クレジットカードで決済を受け付けます' });
                        break;
                    case 'Others':
                        yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: '決済承認を実行します...' });
                        yield paymentService.authorizeAnyPayment({
                            object: {
                                typeOf: cinerinoapi.factory.action.authorize.paymentMethod.any.ResultType.Payment,
                                name: 'LINE POS その他',
                                amount: price,
                                paymentMethod: 'Others'
                            },
                            purpose: { typeOf: cinerinoapi.factory.transactionType.PlaceOrder, id: params.transactionId }
                        });
                        yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '決済の承認がとれました' });
                        break;
                    default:
                        throw new Error(`Unknown payment method ${params.paymentMethodType}`);
                }
            }
            // セッションに金額保管
            yield this.user.saveTransactionAmount(price);
            // 購入者情報確認
            let profile;
            if ((yield this.user.getCredentials()) !== undefined) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'プロフィールを検索しています...' });
                // const loginTicket = params.user.authClient.verifyIdToken({});
                profile = yield personService.getProfile({});
                const lineProfile = yield lineClient_1.default.getProfile(this.user.userId);
                profile = {
                    givenName: (profile.givenName === '') ? lineProfile.displayName : profile.givenName,
                    familyName: (profile.familyName === '') ? 'LINE' : profile.familyName,
                    email: profile.email,
                    telephone: (profile.telephone === '') ? '+819012345678' : profile.telephone
                };
            }
            else {
                profile = yield this.user.findProfile();
            }
            const setCustomerContactQuery = qs.stringify({ profile: profile });
            const setCustomerContactUri = `/projects/${(_c = this.project) === null || _c === void 0 ? void 0 : _c.id}/transactions/placeOrder/${params.transactionId}/setCustomerContact?${setCustomerContactQuery}`;
            const liffUri = `line://app/${process.env.LIFF_ID}?${qs.stringify({ cb: setCustomerContactUri })}`;
            const footerContets = [
                {
                    type: 'button',
                    // flex: 2,
                    style: 'secondary',
                    action: {
                        type: 'uri',
                        label: '変更する',
                        uri: liffUri
                    }
                }
            ];
            if (profile !== undefined) {
                footerContets.push({
                    type: 'button',
                    style: 'primary',
                    action: {
                        type: 'postback',
                        label: 'このまま進む',
                        data: qs.stringify({
                            action: 'setProfile',
                            transactionId: params.transactionId,
                            familyName: profile.familyName,
                            givenName: profile.givenName,
                            email: profile.email,
                            telephone: profile.telephone
                        })
                    }
                });
            }
            yield lineClient_1.default.pushMessage(this.user.userId, [
                {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'bubble',
                        styles: {
                            footer: {
                                separator: true
                            }
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: '購入者情報をご確認ください',
                                    weight: 'bold',
                                    color: '#1DB446',
                                    size: 'sm'
                                },
                                {
                                    type: 'separator',
                                    margin: 'xxl'
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'xxl',
                                    spacing: 'sm',
                                    contents: [
                                        {
                                            type: 'box',
                                            layout: 'vertical',
                                            margin: 'lg',
                                            spacing: 'sm',
                                            contents: [
                                                {
                                                    type: 'box',
                                                    layout: 'baseline',
                                                    spacing: 'sm',
                                                    contents: [
                                                        {
                                                            type: 'text',
                                                            text: 'Name',
                                                            color: '#aaaaaa',
                                                            size: 'sm',
                                                            flex: 1
                                                        },
                                                        {
                                                            type: 'text',
                                                            text: (profile !== undefined)
                                                                ? `${profile.givenName} ${profile.familyName}`
                                                                : '---',
                                                            wrap: true,
                                                            size: 'sm',
                                                            color: '#666666',
                                                            flex: 4
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: 'box',
                                                    layout: 'baseline',
                                                    spacing: 'sm',
                                                    contents: [
                                                        {
                                                            type: 'text',
                                                            text: 'Email',
                                                            color: '#aaaaaa',
                                                            size: 'sm',
                                                            flex: 1
                                                        },
                                                        {
                                                            type: 'text',
                                                            text: (typeof (profile === null || profile === void 0 ? void 0 : profile.email) === 'string') ? profile.email : '---',
                                                            wrap: true,
                                                            size: 'sm',
                                                            color: '#666666',
                                                            flex: 4
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: 'box',
                                                    layout: 'baseline',
                                                    spacing: 'sm',
                                                    contents: [
                                                        {
                                                            type: 'text',
                                                            text: 'Tel',
                                                            color: '#aaaaaa',
                                                            size: 'sm',
                                                            flex: 1
                                                        },
                                                        {
                                                            type: 'text',
                                                            text: (typeof (profile === null || profile === void 0 ? void 0 : profile.telephone) === 'string') ? profile.telephone : '---',
                                                            wrap: true,
                                                            size: 'sm',
                                                            color: '#666666',
                                                            flex: 4
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        footer: {
                            type: 'box',
                            layout: 'vertical',
                            spacing: 'sm',
                            contents: footerContets
                        }
                    }
                }
            ]);
        });
    }
    /**
     * クレジットカード選択
     */
    // tslint:disable-next-line:max-func-body-length
    selectCreditCard(params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchOrganizationsResult = yield sellerService.search({ limit: 1 });
            const seller = searchOrganizationsResult.data[0];
            if (seller.paymentAccepted === undefined) {
                throw new Error('許可された決済方法が見つかりません');
            }
            const creditCardPayment = seller.paymentAccepted.find((p) => p.paymentMethodType === cinerinoapi.factory.paymentMethodType.CreditCard);
            if (creditCardPayment === undefined) {
                throw new Error('クレジットカード決済が許可されていません');
            }
            const inputCreditCardUri = `/projects/${seller.project.id}/transactions/placeOrder/${params.transactionId}/inputCreditCard?gmoShopId=${creditCardPayment.gmoInfo.shopId}&amount=${params.amount}`;
            const liffUri = `line://app/${process.env.LIFF_ID}?${qs.stringify({ cb: inputCreditCardUri })}`;
            const footerContets = [
                {
                    type: 'button',
                    // flex: 2,
                    style: 'secondary',
                    action: {
                        type: 'uri',
                        label: '入力する',
                        uri: liffUri
                    }
                }
            ];
            // ログイン状態の場合、会員カードを選択肢に追加
            if ((yield this.user.getCredentials()) !== undefined) {
                // myクレカサービスに対応しているとは限らない
                let creditCards = [];
                try {
                    const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                        endpoint: process.env.CINERINO_ENDPOINT,
                        auth: this.user.authClient,
                        project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
                    });
                    creditCards = yield personOwnershipInfoService.searchCreditCards({});
                    yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${creditCards.length}件のクレジットカードが見つかりました` });
                }
                catch (error) {
                    yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '※クレジットカード保持サービス非対応' });
                }
                if (creditCards.length > 0) {
                    const creditCard = creditCards[0];
                    footerContets.push({
                        type: 'button',
                        style: 'primary',
                        action: {
                            type: 'postback',
                            label: creditCard.cardNo,
                            data: qs.stringify({
                                action: 'selectPaymentMethodType',
                                amount: params.amount,
                                transactionId: params.transactionId,
                                paymentMethod: cinerinoapi.factory.paymentMethodType.CreditCard,
                                creditCard: {
                                    memberId: 'me',
                                    cardSeq: creditCard.cardSeq
                                }
                            })
                        }
                    });
                }
            }
            yield lineClient_1.default.pushMessage(this.user.userId, [
                {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'bubble',
                        styles: {
                            footer: {
                                separator: true
                            }
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'クレジットカードを選択してください',
                                    weight: 'bold',
                                    color: '#1DB446',
                                    size: 'sm'
                                }
                            ]
                        },
                        footer: {
                            type: 'box',
                            layout: 'vertical',
                            spacing: 'sm',
                            contents: footerContets
                        }
                    }
                }
            ]);
        });
    }
    /**
     * ペイメントカード照会
     */
    checkPaymentCard(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const paymentService = new cinerinoapi.service.Payment({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const paymentCard = yield paymentService.checkPaymentCard({
                object: params.paymentCard
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `カードが見つかりました:${paymentCard.identifier}` });
            const flex = {
                type: 'flex',
                altText: 'This is a Flex Message',
                contents: {
                    type: 'carousel',
                    contents: [
                        contentsBuilder_1.paymentCard2flexBubble({ paymentCard: Object.assign(Object.assign({}, paymentCard), { accessCode: params.paymentCard.accessCode }), user: this.user })
                    ]
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
        });
    }
    /**
     * プロダクト注文
     * メンバーシップ、ペイメントカードなど...
     */
    // tslint:disable-next-line:max-func-body-length
    orderPaymentCard(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __awaiter(this, void 0, void 0, function* () {
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const offerService = new cinerinoapi.service.Offer({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_c = this.project) === null || _c === void 0 ? void 0 : _c.id }
            });
            const productService = new cinerinoapi.service.Product({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_d = this.project) === null || _d === void 0 ? void 0 : _d.id }
            });
            // 販売者検索
            const searchOrganizationsResult = yield sellerService.search({ limit: 1 });
            const seller = searchOrganizationsResult.data[0];
            // if (seller.paymentAccepted === undefined) {
            //     throw new Error('許可された決済方法が見つかりません');
            // }
            // const creditCardPayment = <cinerinoapi.factory.seller.IPaymentAccepted<cinerinoapi.factory.paymentMethodType.CreditCard>>
            //     seller.paymentAccepted.find((p) => p.paymentMethodType === cinerinoapi.factory.paymentMethodType.CreditCard);
            // if (creditCardPayment === undefined) {
            //     throw new Error('クレジットカード決済が許可されていません');
            // }
            // プロダクト検索
            // const product = await productService.search({
            //     limit:1,
            //     id:
            // });
            // オファー未選択であれば、オファー選択へ
            if (typeof ((_e = params.offer) === null || _e === void 0 ? void 0 : _e.id) !== 'string') {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'オファーを検索しています...' });
                const offers = yield productService.searchOffers({
                    itemOffered: { id: (_f = params.itemOffered) === null || _f === void 0 ? void 0 : _f.id },
                    seller: { id: String(seller.id) }
                });
                if (offers.length === 0) {
                    yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'オファーが見つかりませんでした' });
                }
                else {
                    yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${offers.length}オファーが見つかりました` });
                    // tslint:disable-next-line:no-magic-numbers
                    const quickReplyItems4selectOffer = offers.slice(0, 10)
                        .map((o) => {
                        var _a, _b, _c;
                        const unitPriceSpec = o.priceSpecification.priceComponent.find((c) => c.typeOf === cinerinoapi.factory.chevre.priceSpecificationType.UnitPriceSpecification);
                        const priceStr = (unitPriceSpec !== undefined) ? `${unitPriceSpec.price} ${unitPriceSpec.priceCurrency}` : '';
                        // const name = (typeof o.name === 'string') ? o.name : o.name?.ja;
                        let serviceOutputAmountValue = (_c = (_b = (_a = o.itemOffered) === null || _a === void 0 ? void 0 : _a.serviceOutput) === null || _b === void 0 ? void 0 : _b.amount) === null || _c === void 0 ? void 0 : _c.value;
                        if (typeof serviceOutputAmountValue !== 'number') {
                            serviceOutputAmountValue = 0;
                        }
                        return {
                            type: 'action',
                            imageUrl: `https://${this.user.host}/img/labels/reservation-ticket.png`,
                            action: {
                                type: 'postback',
                                label: `${priceStr}円 (${serviceOutputAmountValue}円入金)`,
                                // label: String(o.id),
                                data: qs.stringify({
                                    action: 'orderPaymentCard',
                                    itemOffered: params.itemOffered,
                                    // profile: params.profile,
                                    offer: {
                                        id: o.id
                                    }
                                })
                            }
                        };
                    });
                    const message4selectOffer = {
                        type: 'text',
                        text: 'オファーを選択してください',
                        quickReply: {
                            items: quickReplyItems4selectOffer
                        }
                    };
                    yield lineClient_1.default.pushMessage(this.user.userId, [message4selectOffer]);
                }
                return;
            }
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '注文取引を開始します...' });
            const transaction = yield placeOrderService.start({
                expires: moment()
                    .add(1, 'minutes')
                    .toDate(),
                agent: {},
                seller: {
                    typeOf: seller.typeOf,
                    id: String(seller.id)
                },
                object: {
                // passport: { token: passportToken }
                }
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `取引を開始しました: ${transaction.id}` });
            yield this.user.saveTransaction(transaction);
            const paymentCardAuthorization = yield offerService.authorizeProduct({
                object: [{
                        project: { typeOf: transaction.project.typeOf, id: transaction.project.id },
                        typeOf: cinerinoapi.factory.chevre.offerType.Offer,
                        priceCurrency: cinerinoapi.factory.priceCurrency.JPY,
                        id: (_g = params.offer) === null || _g === void 0 ? void 0 : _g.id,
                        itemOffered: {
                            project: { typeOf: transaction.project.typeOf, id: transaction.project.id },
                            typeOf: cinerinoapi.factory.chevre.product.ProductType.PaymentCard,
                            id: (_h = params.itemOffered) === null || _h === void 0 ? void 0 : _h.id,
                            serviceOutput: {
                                project: { typeOf: transaction.project.typeOf, id: transaction.project.id },
                                typeOf: 'PaymentCard',
                                accessCode: (_k = (_j = params.itemOffered) === null || _j === void 0 ? void 0 : _j.serviceOutput) === null || _k === void 0 ? void 0 : _k.accessCode,
                                name: (_m = (_l = params.itemOffered) === null || _l === void 0 ? void 0 : _l.serviceOutput) === null || _m === void 0 ? void 0 : _m.name,
                                additionalProperty: []
                            }
                        },
                        seller: {
                            project: { typeOf: transaction.project.typeOf, id: transaction.project.id },
                            typeOf: seller.typeOf,
                            name: (typeof seller.name === 'string') ? seller.name : String((_o = seller.name) === null || _o === void 0 ? void 0 : _o.ja)
                        }
                    }],
                purpose: { typeOf: transaction.typeOf, id: transaction.id }
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `オファー ${(_p = params.offer) === null || _p === void 0 ? void 0 : _p.id} を承認しました` });
            yield this.user.saveProductOfferAuthorization(paymentCardAuthorization);
            const price = (_q = paymentCardAuthorization.result) === null || _q === void 0 ? void 0 : _q.price;
            const quickReplyItems = [];
            if (price === 0) {
                quickReplyItems.push({
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                    action: {
                        type: 'postback',
                        label: '決済なし',
                        data: qs.stringify({
                            action: 'selectPaymentMethodType',
                            amount: price,
                            paymentMethod: 'Others',
                            transactionId: transaction.id
                        })
                    }
                });
            }
            else {
                // クレジットカード決済
                quickReplyItems.push({
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/credit-card-64.png`,
                    action: {
                        type: 'postback',
                        label: 'クレジットカード',
                        data: qs.stringify({
                            action: 'selectCreditCard',
                            amount: price,
                            transactionId: transaction.id
                        })
                    }
                });
                if ((yield this.user.getCredentials()) !== undefined) {
                    quickReplyItems.push({
                        type: 'action',
                        imageUrl: `https://${this.user.host}/img/labels/friend-pay-50.png`,
                        action: {
                            type: 'postback',
                            label: 'Friend Pay',
                            data: qs.stringify({
                                action: 'askPaymentCode',
                                amount: price,
                                transactionId: transaction.id
                            })
                        }
                    }, {
                        type: 'action',
                        imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                        action: {
                            type: 'postback',
                            label: 'その他',
                            data: qs.stringify({
                                action: 'selectPaymentMethodType',
                                amount: price,
                                paymentMethod: 'Others',
                                transactionId: transaction.id
                            })
                        }
                    });
                }
            }
            const message = {
                type: 'text',
                text: `決済方法を選択してください(${price}円)`,
                quickReply: {
                    items: quickReplyItems
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [message]);
        });
    }
    /**
     * ペイメントカード選択
     */
    // tslint:disable-next-line:max-func-body-length
    selectPaymentCard(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchOrganizationsResult = yield sellerService.search({ limit: 1 });
            const seller = searchOrganizationsResult.data[0];
            if (seller.paymentAccepted === undefined) {
                throw new Error('許可された決済方法が見つかりません');
            }
            // const creditCardPayment = <cinerinoapi.factory.seller.IPaymentAccepted<cinerinoapi.factory.paymentMethodType.CreditCard>>
            //     seller.paymentAccepted.find((p) => p.paymentMethodType === cinerinoapi.factory.paymentMethodType.CreditCard);
            // if (creditCardPayment === undefined) {
            //     throw new Error('クレジットカード決済が許可されていません');
            // }
            const inputPaymentCardUri = `/projects/${seller.project.id}/transactions/placeOrder/${params.transactionId}/inputPaymentCard?amount=${params.amount}`;
            const liffUri = `line://app/${process.env.LIFF_ID}?${qs.stringify({ cb: inputPaymentCardUri })}`;
            const footerContets = [
                {
                    type: 'button',
                    // flex: 2,
                    style: 'secondary',
                    action: {
                        type: 'uri',
                        label: '入力する',
                        uri: liffUri
                    }
                }
            ];
            // ログイン状態の場合、会員カードを選択肢に追加
            // if (await this.user.getCredentials() !== undefined) {
            //     const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            //         endpoint: <string>process.env.CINERINO_ENDPOINT,
            //         auth: this.user.authClient,
            //         project: { id: this.project?.id }
            //     });
            //     const creditCards = await personOwnershipInfoService.searchCreditCards({});
            //     await LINE.pushMessage(this.user.userId, { type: 'text', text: `${creditCards.length}件のクレジットカードが見つかりました` });
            //     if (creditCards.length > 0) {
            //         const creditCard = creditCards[0];
            //         footerContets.push({
            //             type: 'button',
            //             style: 'primary',
            //             action: {
            //                 type: 'postback',
            //                 label: creditCard.cardNo,
            //                 data: qs.stringify({
            //                     action: 'selectPaymentMethodType',
            //                     transactionId: params.transactionId,
            //                     paymentMethod: cinerinoapi.factory.paymentMethodType.CreditCard,
            //                     creditCard: {
            //                         memberId: 'me',
            //                         cardSeq: creditCard.cardSeq
            //                     }
            //                 })
            //             }
            //         });
            //     }
            // }
            yield lineClient_1.default.pushMessage(this.user.userId, [
                {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'bubble',
                        styles: {
                            footer: {
                                separator: true
                            }
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ペイメントカードを選択してください',
                                    weight: 'bold',
                                    color: '#1DB446',
                                    size: 'sm'
                                }
                            ]
                        },
                        footer: {
                            type: 'box',
                            layout: 'vertical',
                            spacing: 'sm',
                            contents: footerContets
                        }
                    }
                }
            ]);
        });
    }
    /**
     * 購入者情報決定
     */
    setProfile(params) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const placeOrderService = new cinerinoapi.service.txn.PlaceOrder({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
            });
            const transaction = yield this.user.findTransaction();
            const seller = yield sellerService.findById({ id: String(transaction.seller.id) });
            const profile = {
                familyName: params.familyName,
                givenName: params.givenName,
                email: params.email,
                name: `${params.givenName} ${params.familyName}`,
                telephone: params.telephone
            };
            yield placeOrderService.setProfile({
                id: params.transactionId,
                agent: profile
            });
            yield this.user.saveProfile(profile);
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `プロフィールを設定しました: ${transaction.id}` });
            // 注文内容確認
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `注文内容を確認します... ${transaction.id}` });
            const seatReservationAuthorization = yield this.user.findSeatReservationAuthorization({ purpose: { id: transaction.id } });
            let tmpReservations = (_c = seatReservationAuthorization === null || seatReservationAuthorization === void 0 ? void 0 : seatReservationAuthorization.result) === null || _c === void 0 ? void 0 : _c.responseBody.object.reservations;
            tmpReservations = (Array.isArray(tmpReservations)) ? tmpReservations : [];
            const productOfferAuthorization = yield this.user.findProductOfferAuthorization({ purpose: { id: transaction.id } });
            let productOffers = productOfferAuthorization === null || productOfferAuthorization === void 0 ? void 0 : productOfferAuthorization.object;
            productOffers = (Array.isArray(productOffers)) ? productOffers : [];
            const price = yield this.user.findTransactionAmount();
            yield lineClient_1.default.pushMessage(this.user.userId, [
                contentsBuilder_1.createConfirmOrderFlexBubble({
                    seller: seller,
                    profile: profile,
                    productOffers,
                    tmpReservations,
                    id: params.transactionId,
                    price: price
                })
            ]);
        });
    }
    confirmOrder(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: '注文を確定しています...' });
            const placeOrderService = new cinerinoapi.service.txn.PlaceOrder({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const { order } = yield placeOrderService.confirm({
                id: params.transactionId,
                potentialActions: {
                    order: {
                        potentialActions: {
                            sendOrder: {
                                potentialActions: {
                                    sendEmailMessage: [{
                                            object: {
                                                about: 'LINE Ticket 注文配送完了',
                                                sender: { email: 'cinerino-line-ticket@example.com' },
                                                toRecipient: { name: `LINE User ${this.user.userId}` }
                                            }
                                        }]
                                }
                            }
                        }
                    }
                }
                // options: {
                //     sendEmailMessage: true,
                //     email: {
                //         about: 'LINE Ticket 注文配送完了',
                //         sender: { email: 'cinerino-line-ticket@example.com' },
                //         toRecipient: { name: `LINE User ${params.user.userId}` }
                //     }
                // }
            });
            const flex = {
                type: 'flex',
                altText: 'This is a Flex Message',
                contents: contentsBuilder_1.order2flexBubble({ order })
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
        });
    }
    cancelOrder(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: '注文取引をキャンセルしています...' });
            const placeOrderService = new cinerinoapi.service.txn.PlaceOrder({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            yield placeOrderService.cancel({
                id: params.transactionId
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '注文取引をキャンセルしました' });
        });
    }
    /**
     * 友達決済を承認確定
     */
    confirmFriendPay(__) {
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'implementing...' });
            // await LINE.replyMessage(params.replyToken, { type: 'text', text: 'implementing...' });
            // const friendPayInfo = await params.user.verifyFriendPayToken(params.token);
            // await LINE.replyMessage(params.replyToken, { type: 'text', text: `${friendPayInfo.price}円の友達決済を受け付けます` });
            // await LINE.pushMessage(params.user.userId, { type: 'text', text: '残高を確認しています...' });
            // const personService = new cinerinoapi.service.Person({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: params.user.authClient
            // });
            // const placeOrderService = new cinerinoapi.service.txn.PlaceOrder({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: params.user.authClient
            // });
            // const actionRepo = new cinerino.repository.Action(cinerino.mongoose.connection);
            // const authorizeActions = await actionRepo.findAuthorizeByTransactionId(friendPayInfo.transactionId);
            // const seatReservations = <cinerinoapi.factory.action.authorize.offer.seatReservation.IAction[]>authorizeActions
            //     .filter((a) => a.actionStatus === cinerinoapi.factory.actionStatusType.CompletedActionStatus)
            //     .filter((a) => a.object.typeOf === cinerinoapi.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation);
            // const requiredPoint = (<cinerinoapi.factory.action.authorize.offer.seatReservation.IResult>seatReservations[0].result).point;
            // let accounts = await personService.searchAccounts({ accountType: cinerinoapi.factory.accountType.Coin })
            //     .then((ownershipInfos) => ownershipInfos.map((o) => o.typeOfGood));
            // accounts = accounts.filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
            // debug('accounts:', accounts);
            // if (accounts.length === 0) {
            //     throw new Error('口座未開設です');
            // }
            // const account = accounts[0];
            // const pecorinoAuthorization = await placeOrderService.authorizeAccountPayment({
            //     transactionId: friendPayInfo.transactionId,
            //     amount: requiredPoint,
            //     fromAccount: {
            //         accountType: cinerinoapi.factory.accountType.Coin,
            //         accountNumber: account.accountNumber
            //     }
            // });
            // debug('残高確認済', pecorinoAuthorization);
            // await LINE.pushMessage(params.user.userId, { type: 'text', text: '残高の確認がとれました' });
            // await LINE.pushMessage(params.user.userId, { type: 'text', text: '友達決済を承認しました' });
            // const template: TemplateMessage = {
            //     type: 'template',
            //     altText: 'This is a buttons template',
            //     template: {
            //         type: 'confirm',
            //         text: '取引を続行しますか?',
            //         actions: [
            //             {
            //                 type: 'postback',
            //                 label: 'Yes',
            //                 data: qs.stringify({
            //                     action: 'continueTransactionAfterFriendPayConfirmation',
            //                     transactionId: friendPayInfo.transactionId,
            //                     price: friendPayInfo.price
            //                 })
            //             },
            //             {
            //                 type: 'postback',
            //                 label: 'No',
            //                 data: qs.stringify({
            //                     action: 'cancelTransactionAfterFriendPayConfirmation',
            //                     transactionId: friendPayInfo.transactionId,
            //                     price: friendPayInfo.price
            //                 })
            //             }
            //         ]
            //     }
            // };
            // await LINE.pushMessage(params.user.userId, [template]);
        });
    }
    /**
     * おこづかい承認確定
     */
    confirmTransferMoney(params) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const transferMoneyInfo = yield this.user.verifyTransferMoneyToken(params.token);
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `${transferMoneyInfo.name}に${params.price}円の振込を実行します...` });
            const personService = new cinerinoapi.service.Person({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_c = this.project) === null || _c === void 0 ? void 0 : _c.id }
            });
            const searchAccountsResult = yield personOwnershipInfoService.search({
                typeOfGood: {
                    typeOf: 'Account',
                    accountType: cinerinoapi.factory.accountType.Prepaid
                }
            });
            const accounts = searchAccountsResult.data
                .map((o) => o.typeOfGood)
                .filter((a) => (a).status === cinerinoapi.factory.accountStatusType.Opened);
            const account = accounts.shift();
            if (account === undefined) {
                throw new Error('ペイメントカード未作成なので振込を実行できません');
            }
            // 取引に販売者を指定する必要があるので、適当に検索
            const searchSellersResult = yield sellerService.search({ limit: 1 });
            const seller = searchSellersResult.data.shift();
            if (seller === undefined) {
                throw new Error('販売者が見つかりませんでした');
            }
            const profile = yield personService.getProfile({});
            const coinAccountController = new coin_1.CoinAccountController(this.req);
            yield coinAccountController.processTransferCoin({
                amount: params.price,
                fromLocation: {
                    accountNumber: account.accountNumber
                },
                transferMoneyInfo: transferMoneyInfo,
                profile: profile,
                seller: seller
            });
        });
    }
    /**
     * ペイメントカード入金金額選択
     */
    selectDepositAmount(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = {
                type: 'text',
                text: 'いくら入金しますか?',
                quickReply: {
                    items: [
                        {
                            type: 'action',
                            imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                            action: {
                                type: 'postback',
                                label: '100',
                                data: qs.stringify({
                                    action: 'depositCoinByCreditCard',
                                    amount: 100,
                                    paymentCard: params.paymentCard
                                })
                            }
                        },
                        {
                            type: 'action',
                            imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                            action: {
                                type: 'postback',
                                label: '1000',
                                data: qs.stringify({
                                    action: 'depositCoinByCreditCard',
                                    amount: 1000,
                                    paymentCard: params.paymentCard
                                })
                            }
                        },
                        {
                            type: 'action',
                            imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                            action: {
                                type: 'postback',
                                label: '10000',
                                data: qs.stringify({
                                    action: 'depositCoinByCreditCard',
                                    amount: 10000,
                                    paymentCard: params.paymentCard
                                })
                            }
                        }
                    ]
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [message]);
        });
    }
    /**
     * クレジット決済でペイメントカード入金
     */
    // tslint:disable-next-line:max-func-body-length
    depositCoinByCreditCard(params) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `${params.amount}円の入金処理を実行します...` });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const placeOrderService = new cinerinoapi.service.txn.PlaceOrder({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
            });
            const offerService = new cinerinoapi.service.Offer({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_c = this.project) === null || _c === void 0 ? void 0 : _c.id }
            });
            // 販売者情報取得
            const searchSellersResult = yield sellerService.search({
                project: { id: { $eq: (_d = this.req.project) === null || _d === void 0 ? void 0 : _d.id } }
            });
            const seller = searchSellersResult.data.shift();
            if (seller === undefined) {
                throw new Error('販売者が見つかりません');
            }
            const TRANSACTION_EXPIRES_IN_MINUTES = 5;
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '取引を開始します...' });
            const transaction = yield placeOrderService.start({
                expires: moment()
                    .add(TRANSACTION_EXPIRES_IN_MINUTES, 'minutes')
                    .toDate(),
                seller: { id: String(seller.id), typeOf: seller.typeOf },
                object: {}
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${TRANSACTION_EXPIRES_IN_MINUTES}分以内に取引を終了してください` });
            debug('transaction started.', transaction.id);
            yield this.user.saveTransaction(transaction);
            yield offerService.authorizeMonetaryAmount({
                object: {
                    project: { typeOf: cinerinoapi.factory.chevre.organizationType.Project, id: transaction.project.id },
                    typeOf: cinerinoapi.factory.chevre.offerType.Offer,
                    itemOffered: {
                        typeOf: 'MonetaryAmount',
                        value: Number(params.amount),
                        currency: cinerinoapi.factory.accountType.Prepaid
                    },
                    priceCurrency: cinerinoapi.factory.priceCurrency.JPY,
                    seller: {
                        project: { typeOf: cinerinoapi.factory.chevre.organizationType.Project, id: transaction.project.id },
                        typeOf: seller.typeOf,
                        name: (typeof seller.name === 'string') ? seller.name : String((_e = seller.name) === null || _e === void 0 ? void 0 : _e.ja)
                    },
                    toLocation: params.paymentCard
                },
                purpose: { typeOf: transaction.typeOf, id: transaction.id }
            });
            const price = params.amount;
            const quickReplyItems = [];
            if (price === 0) {
                quickReplyItems.push({
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                    action: {
                        type: 'postback',
                        label: '決済なし',
                        data: qs.stringify({
                            action: 'selectPaymentMethodType',
                            amount: 0,
                            paymentMethod: 'Others',
                            transactionId: transaction.id
                        })
                    }
                });
            }
            else {
                // クレジットカード決済
                quickReplyItems.push({
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/credit-card-64.png`,
                    action: {
                        type: 'postback',
                        label: 'クレジットカード',
                        data: qs.stringify({
                            action: 'selectCreditCard',
                            amount: price,
                            transactionId: transaction.id
                        })
                    }
                }, {
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/credit-card-64.png`,
                    action: {
                        type: 'postback',
                        label: 'ペイメントカード',
                        data: qs.stringify({
                            action: 'selectPaymentCard',
                            amount: price,
                            transactionId: transaction.id
                        })
                    }
                });
                if ((yield this.user.getCredentials()) !== undefined) {
                    quickReplyItems.push({
                        type: 'action',
                        imageUrl: `https://${this.user.host}/img/labels/friend-pay-50.png`,
                        action: {
                            type: 'postback',
                            label: 'Friend Pay',
                            data: qs.stringify({
                                action: 'askPaymentCode',
                                amount: price,
                                transactionId: transaction.id
                            })
                        }
                    }, {
                        type: 'action',
                        imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                        action: {
                            type: 'postback',
                            label: 'その他',
                            data: qs.stringify({
                                action: 'selectPaymentMethodType',
                                amount: price,
                                paymentMethod: 'Others',
                                transactionId: transaction.id
                            })
                        }
                    });
                }
            }
            const message = {
                type: 'text',
                text: `決済方法を選択してください(${price}円)`,
                quickReply: {
                    items: quickReplyItems
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [message]);
        });
    }
    /**
     * クレジットカード検索
     */
    searchCreditCards(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: 'クレジットカードを検索しています...' });
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const creditCards = yield personOwnershipInfoService.searchCreditCards({});
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${creditCards.length}件のクレジットカードがみつかりました` });
            if (creditCards.length > 0) {
                const flex = {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'carousel',
                        contents: [
                            ...creditCards.map((creditCard) => {
                                return contentsBuilder_1.creditCard2flexBubble({ creditCard: creditCard, user: this.user });
                            })
                        ]
                    }
                };
                yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
            }
        });
    }
    addCreditCard(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const creditCard = yield personOwnershipInfoService.addCreditCard({ creditCard: { token: params.token } });
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `クレジットカード ${creditCard.cardNo} が追加されました` });
        });
    }
    deleteCreditCard(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            yield personOwnershipInfoService.deleteCreditCard({ cardSeq: params.cardSeq });
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: 'クレジットカードが削除されました' });
        });
    }
    /**
     * 口座開設
     */
    openAccount(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const openResult = yield personOwnershipInfoService.openAccount({
                name: params.name,
                accountType: params.accountType
            });
            yield lineClient_1.default.replyMessage(params.replyToken, {
                type: 'text',
                text: `${params.accountType}口座 が開設されました 注文番号:${openResult.order.orderNumber}`
            });
        });
    }
    /**
     * 口座解約
     */
    closeAccount(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            yield personOwnershipInfoService.closeAccount({ accountNumber: params.accountNumber });
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `${params.accountType}口座 ${params.accountNumber} が解約されました` });
        });
    }
    searchCoinAccounts(__) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchAccountsResult = yield personOwnershipInfoService.search({
                typeOfGood: {
                    typeOf: 'Account',
                    accountType: cinerinoapi.factory.accountType.Prepaid
                }
            });
            const accountOwnershipInfos = searchAccountsResult.data.filter((o) => o.typeOfGood.status
                === cinerinoapi.factory.accountStatusType.Opened);
            if (accountOwnershipInfos.length === 0) {
                throw new Error('口座未開設です');
            }
            const flex = {
                type: 'flex',
                altText: 'This is a Flex Message',
                contents: {
                    type: 'carousel',
                    contents: [
                        ...accountOwnershipInfos.map((ownershipInfo) => {
                            return contentsBuilder_1.account2flexBubble({ ownershipInfo: ownershipInfo, user: this.user });
                        })
                    ]
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
        });
    }
    /**
     * 口座取引履歴検索
     */
    searchAccountMoneyTransferActions(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchAccountsResult = yield personOwnershipInfoService.search({
                typeOfGood: {
                    typeOf: 'Account',
                    accountType: params.accountType
                }
            });
            const accountOwnershipInfo = searchAccountsResult.data.find((o) => o.typeOfGood.accountNumber === params.accountNumber);
            debug('accounts:', accountOwnershipInfo);
            if (accountOwnershipInfo === undefined) {
                throw new Error('口座が見つかりません');
            }
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: '取引履歴を検索します...' });
            const searchActions = yield personOwnershipInfoService.searchAccountMoneyTransferActions({
                limit: 10,
                page: 1,
                sort: {
                    startDate: cinerinoapi.factory.sortType.Descending
                },
                accountNumber: params.accountNumber
            });
            const transferActions = searchActions.data;
            if (searchActions.data.length === 0) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'まだ取引履歴はありません' });
                return;
            }
            yield lineClient_1.default.pushMessage(this.user.userId, {
                type: 'text',
                text: '取引履歴が見つかりました'
            });
            if (transferActions.length > 0) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `直近の${transferActions.length}件は以下の通りです` });
                const flex = {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'carousel',
                        contents: [
                            ...transferActions.map((a) => {
                                return contentsBuilder_1.moneyTransferAction2flexBubble({ action: a, user: this.user });
                            })
                        ]
                    }
                };
                yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
            }
        });
    }
    /**
     * ユーザーのチケット(予約)を検索する
     */
    searchScreeningEventReservations(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: 'ここ一カ月の予約を検索しています...' });
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchScreeningEventReservationsResult = yield personOwnershipInfoService.search({
                typeOfGood: {
                    typeOf: cinerinoapi.factory.chevre.reservationType.EventReservation
                },
                ownedFrom: moment(now)
                    .add(-1, 'month')
                    .toDate(),
                ownedThrough: now,
                limit: 10,
                page: 1,
                sort: {
                    ownedFrom: cinerinoapi.factory.sortType.Descending
                }
            });
            const ownershipInfos = searchScreeningEventReservationsResult.data;
            // 未来の予約
            if (searchScreeningEventReservationsResult.data.length === 0) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '予約が見つかりませんでした' });
            }
            else {
                yield lineClient_1.default.pushMessage(this.user.userId, {
                    type: 'text',
                    text: '予約が見つかりました'
                });
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `直近の${ownershipInfos.length}件は以下の通りです` });
                const flex = {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'carousel',
                        contents: [
                            ...ownershipInfos
                                .map((ownershipInfo) => {
                                return contentsBuilder_1.reservation2flexBubble({ ownershipInfo: ownershipInfo });
                            })
                        ]
                    }
                };
                yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
            }
        });
    }
    /**
     * 仮予約
     */
    // tslint:disable-next-line:max-func-body-length
    selectSeatOffers(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const eventService = new cinerinoapi.service.Event({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
            });
            const placeOrderService = new cinerinoapi.service.txn.PlaceOrder({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_c = this.project) === null || _c === void 0 ? void 0 : _c.id }
            });
            const event = yield eventService.findById({ id: params.eventId });
            const reservedSeatsAvailable = ((_f = (_e = (_d = event.offers) === null || _d === void 0 ? void 0 : _d.itemOffered.serviceOutput) === null || _e === void 0 ? void 0 : _e.reservedTicket) === null || _f === void 0 ? void 0 : _f.ticketedSeat) !== undefined;
            // 販売者情報取得(イベントのオファーに販売者情報あり)
            const searchSellersResult = yield sellerService.search({
                project: { id: { $eq: event.project.id } }
            });
            const seller = searchSellersResult.data.find((s) => { var _a, _b; return s.id === ((_b = (_a = event.offers) === null || _a === void 0 ? void 0 : _a.seller) === null || _b === void 0 ? void 0 : _b.id); });
            if (seller === undefined) {
                throw new Error(`イベントの販売者が見つかりません: ${(_h = (_g = event.offers) === null || _g === void 0 ? void 0 : _g.seller) === null || _h === void 0 ? void 0 : _h.id}`);
            }
            // 取引開始
            // 許可証トークンパラメーターがなければ、WAITERで許可証を取得
            // const passportToken = await request.post(
            //     `${process.env.WAITER_ENDPOINT}/passports`,
            //     {
            //         body: {
            //             scope: `placeOrderTransaction.${seller.id}`
            //         },
            //         json: true
            //     }
            // ).then((body) => body.token);
            // debug('passportToken published.', passportToken);
            const storeId = this.user.authClient.options.clientId;
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `店舗ID:${storeId}でオファーを検索しています...` });
            let ticketOffers = yield eventService.searchTicketOffers({
                event: { id: params.eventId },
                seller: { id: String(seller.id), typeOf: seller.typeOf },
                store: { id: storeId }
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${ticketOffers.length}件のオファーが見つかりました` });
            // ムビチケ以外のオファーを選択
            ticketOffers = ticketOffers.filter((offer) => {
                const movieTicketTypeChargeSpecification = offer.priceSpecification.priceComponent.find((component) => component.typeOf === cinerinoapi.factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification);
                return movieTicketTypeChargeSpecification === undefined;
            });
            if (ticketOffers.length === 0) {
                throw new Error('使用可能なオファーが見つかりませんでした');
            }
            // オファー未選択であれば、オファー選択へ
            if (params.offerId === undefined) {
                // tslint:disable-next-line:no-magic-numbers
                const quickReplyItems4selectOffer = ticketOffers.slice(0, 10)
                    .map((o) => {
                    var _a;
                    const unitPriceSpec = o.priceSpecification.priceComponent.find((c) => c.typeOf === cinerinoapi.factory.chevre.priceSpecificationType.UnitPriceSpecification);
                    const priceStr = (unitPriceSpec !== undefined) ? `${unitPriceSpec.price} ${unitPriceSpec.priceCurrency}` : '';
                    const name = (typeof o.name === 'string') ? o.name : (_a = o.name) === null || _a === void 0 ? void 0 : _a.ja;
                    return {
                        type: 'action',
                        imageUrl: `https://${this.user.host}/img/labels/reservation-ticket.png`,
                        action: {
                            type: 'postback',
                            label: `${String(name)
                                // tslint:disable-next-line:no-magic-numbers
                                .slice(0, 8)} ${priceStr}`,
                            data: qs.stringify({
                                action: 'selectSeatOffers',
                                seatNumbers: (params.seatNumbers !== undefined) ? params.seatNumbers.join(',') : undefined,
                                numSeats: params.numSeats,
                                eventId: params.eventId,
                                offerId: o.id
                            })
                        }
                    };
                });
                const message4selectOffer = {
                    type: 'text',
                    text: 'オファーを選択してください',
                    quickReply: {
                        items: quickReplyItems4selectOffer
                    }
                };
                yield lineClient_1.default.pushMessage(this.user.userId, [message4selectOffer]);
                return;
            }
            const selectedTicketOffer = ticketOffers.find((o) => o.id === params.offerId);
            if (selectedTicketOffer === undefined) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `オファー ${params.offerId} が見つかりません` });
                return;
            }
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `オファー ${selectedTicketOffer.identifier} を選択しました` });
            const TRANSACTION_EXPIRES_IN_MINUTES = 5;
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '取引を開始します...' });
            const transaction = yield placeOrderService.start({
                expires: moment()
                    .add(TRANSACTION_EXPIRES_IN_MINUTES, 'minutes')
                    .toDate(),
                seller: { id: String(seller.id), typeOf: seller.typeOf },
                object: {}
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${TRANSACTION_EXPIRES_IN_MINUTES}分以内に取引を終了してください` });
            debug('transaction started.', transaction.id);
            yield this.user.saveTransaction(transaction);
            // tslint:disable-next-line:max-line-length
            let seatReservationAuthorization;
            if (reservedSeatsAvailable) {
                if (params.seatNumbers === undefined) {
                    yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '座席が指定されていません' });
                    return;
                }
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${event.name.ja}の座席を確保します...` });
                debug('creating a seat reservation authorization...');
                const authorizeObject = {
                    reservationFor: { id: event.id },
                    acceptedOffer: params.seatNumbers.map((seatNumber) => {
                        // return '';
                        return {
                            id: selectedTicketOffer.id,
                            itemOffered: {
                                serviceOutput: {
                                    typeOf: cinerinoapi.factory.reservationType.EventReservation,
                                    // additionalProperty?: IPropertyValue<string>[];
                                    // additionalTicketText?: string;
                                    // programMembershipUsed?: {
                                    //     accessCode?: string;
                                    //     identifier?: string;
                                    // };
                                    reservedTicket: {
                                        typeOf: 'Ticket',
                                        ticketedSeat: {
                                            typeOf: cinerinoapi.factory.chevre.placeType.Seat,
                                            seatNumber: seatNumber,
                                            seatSection: 'Default',
                                            seatRow: ''
                                            // seatingType: <any>{}
                                        }
                                    }
                                    // subReservation?: IAcceptedSubReservation[];
                                }
                            }
                            // additionalProperty: []
                        };
                    })
                };
                seatReservationAuthorization = (yield placeOrderService.authorizeSeatReservation({
                    object: authorizeObject,
                    purpose: transaction
                }));
                debug('seatReservationAuthorization:', seatReservationAuthorization);
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `座席 ${params.seatNumbers.join(' ')} を確保しました` });
                yield this.user.saveSeatReservationAuthorization(seatReservationAuthorization);
            }
            else {
                if (params.numSeats === undefined) {
                    yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '枚数が指定されていません' });
                    return;
                }
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${params.numSeats}枚を確保します...` });
                debug('creating a seat reservation authorization...');
                seatReservationAuthorization = (yield placeOrderService.authorizeSeatReservation({
                    object: {
                        reservationFor: { id: event.id },
                        // tslint:disable-next-line:prefer-array-literal
                        acceptedOffer: [...Array(params.numSeats)].map(() => {
                            return {
                                id: selectedTicketOffer.id,
                                additionalProperty: []
                            };
                        })
                    },
                    purpose: transaction
                }));
                debug('seatReservationAuthorization:', seatReservationAuthorization);
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `${params.numSeats}枚を確保しました` });
                yield this.user.saveSeatReservationAuthorization(seatReservationAuthorization);
            }
            if (seatReservationAuthorization.result === undefined) {
                throw new Error('予約承認結果が見つかりません');
            }
            const price = seatReservationAuthorization.result.price;
            const quickReplyItems = [];
            if (price === 0) {
                quickReplyItems.push({
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                    action: {
                        type: 'postback',
                        label: '決済なし',
                        data: qs.stringify({
                            action: 'selectPaymentMethodType',
                            amount: price,
                            paymentMethod: 'Others',
                            transactionId: transaction.id
                        })
                    }
                });
            }
            else {
                // クレジットカード決済
                quickReplyItems.push({
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/credit-card-64.png`,
                    action: {
                        type: 'postback',
                        label: 'クレジットカード',
                        data: qs.stringify({
                            action: 'selectCreditCard',
                            amount: price,
                            transactionId: transaction.id
                        })
                    }
                }, {
                    type: 'action',
                    imageUrl: `https://${this.user.host}/img/labels/credit-card-64.png`,
                    action: {
                        type: 'postback',
                        label: 'ペイメントカード',
                        data: qs.stringify({
                            action: 'selectPaymentCard',
                            amount: price,
                            transactionId: transaction.id
                        })
                    }
                });
                if ((yield this.user.getCredentials()) !== undefined) {
                    quickReplyItems.push({
                        type: 'action',
                        imageUrl: `https://${this.user.host}/img/labels/friend-pay-50.png`,
                        action: {
                            type: 'postback',
                            label: 'Friend Pay',
                            data: qs.stringify({
                                action: 'askPaymentCode',
                                amount: price,
                                transactionId: transaction.id
                            })
                        }
                    }, {
                        type: 'action',
                        imageUrl: `https://${this.user.host}/img/labels/coin-64.png`,
                        action: {
                            type: 'postback',
                            label: 'その他',
                            data: qs.stringify({
                                action: 'selectPaymentMethodType',
                                amount: price,
                                paymentMethod: 'Others',
                                transactionId: transaction.id
                            })
                        }
                    });
                }
            }
            const message = {
                type: 'text',
                text: `決済方法を選択してください(${price}円)`,
                quickReply: {
                    items: quickReplyItems
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [message]);
        });
    }
    /**
     * 所有権コード発行
     */
    // tslint:disable-next-line:max-func-body-length
    authorizeOwnershipInfo(params) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: 'コード発行中...' });
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const eventService = new cinerinoapi.service.Event({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_b = this.project) === null || _b === void 0 ? void 0 : _b.id }
            });
            const { code } = yield personOwnershipInfoService.authorize({
                ownershipInfoId: params.id
            });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'コードが発行されました' });
            let flex;
            switch (params.goodType) {
                case cinerinoapi.factory.chevre.reservationType.EventReservation:
                    const searchScreeningEventReservationsResult = yield personOwnershipInfoService.search({
                        typeOfGood: {
                            typeOf: cinerinoapi.factory.chevre.reservationType.EventReservation
                        }
                    });
                    const ownershipInfos = searchScreeningEventReservationsResult.data;
                    const reservation = ownershipInfos.find((o) => o.id === params.id);
                    if (reservation === undefined) {
                        throw new Error('Reservation not found');
                    }
                    const itemOffered = reservation.typeOfGood;
                    const event = yield eventService.findById({
                        id: itemOffered.reservationFor.id
                    });
                    const thumbnailImageUrl = (event.workPerformed !== undefined
                        && event.workPerformed.thumbnailUrl !== undefined
                        && event.workPerformed.thumbnailUrl !== null)
                        ? event.workPerformed.thumbnailUrl
                        // tslint:disable-next-line:max-line-length
                        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz';
                    flex = {
                        type: 'flex',
                        altText: 'This is a Flex Message',
                        contents: {
                            type: 'carousel',
                            contents: [
                                {
                                    type: 'bubble',
                                    hero: {
                                        type: 'image',
                                        url: thumbnailImageUrl,
                                        size: 'full',
                                        aspectRatio: '20:13',
                                        aspectMode: 'cover',
                                        action: {
                                            type: 'uri',
                                            label: 'event',
                                            // tslint:disable-next-line:no-http-string
                                            uri: 'http://linecorp.com/'
                                        }
                                    },
                                    body: {
                                        type: 'box',
                                        layout: 'vertical',
                                        spacing: 'md',
                                        contents: [
                                            {
                                                type: 'text',
                                                text: String(event.name.ja),
                                                wrap: true,
                                                weight: 'bold',
                                                gravity: 'center',
                                                size: 'xl'
                                            },
                                            {
                                                type: 'box',
                                                layout: 'vertical',
                                                margin: 'lg',
                                                spacing: 'sm',
                                                contents: [
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: '日時',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 1
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: moment(event.startDate)
                                                                    .format('llll'),
                                                                wrap: true,
                                                                size: 'sm',
                                                                color: '#666666',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: '場所',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 1
                                                            },
                                                            {
                                                                type: 'text',
                                                                // tslint:disable-next-line:max-line-length
                                                                text: `${event.superEvent.location.name.ja} ${event.location.name.ja}`,
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: '座席',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 1
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: (itemOffered.reservedTicket.ticketedSeat !== undefined)
                                                                    ? itemOffered.reservedTicket.ticketedSeat.seatNumber
                                                                    : '座席なし',
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: '券種',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 1
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: (typeof itemOffered.reservedTicket.ticketType.name === 'string')
                                                                    ? String(itemOffered.reservedTicket.ticketType.name)
                                                                    : String((_c = itemOffered.reservedTicket.ticketType.name) === null || _c === void 0 ? void 0 : _c.ja),
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: '発行者',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 1
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: (itemOffered.reservedTicket.issuedBy !== undefined)
                                                                    ? itemOffered.reservedTicket.issuedBy.name
                                                                    : 'No reservedTicket.issuedBy',
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: '予約者',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 1
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: (itemOffered.reservedTicket.underName !== undefined)
                                                                    ? itemOffered.reservedTicket.underName.name
                                                                    : 'No edTicket.underName',
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: 'Status',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 1
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: String(itemOffered.reservationStatus),
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'vertical',
                                                        margin: 'xxl',
                                                        contents: [
                                                            {
                                                                type: 'spacer',
                                                                size: 'md'
                                                            },
                                                            {
                                                                type: 'image',
                                                                // tslint:disable-next-line:max-line-length
                                                                url: `https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=${code}`,
                                                                aspectMode: 'cover',
                                                                size: 'xl'
                                                            },
                                                            {
                                                                type: 'text',
                                                                // tslint:disable-next-line:max-line-length
                                                                text: 'You can enter the theater by using this code instead of a ticket',
                                                                color: '#aaaaaa',
                                                                wrap: true,
                                                                margin: 'xxl',
                                                                size: 'xs'
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    };
                    yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
                    break;
                case 'Account':
                    const searchAccountsResult = yield personOwnershipInfoService.search({
                        typeOfGood: {
                            typeOf: 'Account',
                            accountType: cinerinoapi.factory.accountType.Prepaid
                        }
                    });
                    const accountOwnershipInfo = searchAccountsResult.data.find((o) => o.id === params.id);
                    if (accountOwnershipInfo === undefined) {
                        throw new Error('Account not found');
                    }
                    const account = accountOwnershipInfo.typeOfGood;
                    flex = {
                        type: 'flex',
                        altText: 'This is a Flex Message',
                        contents: {
                            type: 'carousel',
                            contents: [
                                {
                                    type: 'bubble',
                                    styles: {
                                        footer: {
                                            separator: true
                                        }
                                    },
                                    body: {
                                        type: 'box',
                                        layout: 'vertical',
                                        spacing: 'md',
                                        contents: [
                                            {
                                                type: 'text',
                                                text: account.accountNumber,
                                                wrap: true,
                                                weight: 'bold',
                                                gravity: 'center',
                                                size: 'xl'
                                            },
                                            {
                                                type: 'box',
                                                layout: 'vertical',
                                                margin: 'lg',
                                                spacing: 'sm',
                                                contents: [
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: 'Name',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 2
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: account.name,
                                                                wrap: true,
                                                                size: 'sm',
                                                                color: '#666666',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: 'Type',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 2
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: account.accountType,
                                                                wrap: true,
                                                                size: 'sm',
                                                                color: '#666666',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: 'Balance',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 2
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: `${account.balance}`,
                                                                wrap: true,
                                                                size: 'sm',
                                                                color: '#666666',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: 'Available',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 2
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: `${account.availableBalance}`,
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: 'Status',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 2
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: account.status,
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'baseline',
                                                        spacing: 'sm',
                                                        contents: [
                                                            {
                                                                type: 'text',
                                                                text: 'OpenDate',
                                                                color: '#aaaaaa',
                                                                size: 'sm',
                                                                flex: 2
                                                            },
                                                            {
                                                                type: 'text',
                                                                text: moment(account.openDate)
                                                                    .format('lll'),
                                                                wrap: true,
                                                                color: '#666666',
                                                                size: 'sm',
                                                                flex: 4
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'box',
                                                        layout: 'vertical',
                                                        margin: 'xxl',
                                                        contents: [
                                                            {
                                                                type: 'spacer',
                                                                size: 'md'
                                                            },
                                                            {
                                                                type: 'image',
                                                                // tslint:disable-next-line:max-line-length
                                                                url: `https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=${code}`,
                                                                aspectMode: 'cover',
                                                                size: 'xl'
                                                            },
                                                            {
                                                                type: 'text',
                                                                // tslint:disable-next-line:max-line-length
                                                                text: 'You can enter the theater by using this code instead of a ticket',
                                                                color: '#aaaaaa',
                                                                wrap: true,
                                                                margin: 'xxl',
                                                                size: 'xs'
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    };
                    yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
                    break;
                default:
                    throw new Error(`Unknown goodType ${params.goodType}`);
            }
        });
    }
    /**
     * 注文を検索する
     */
    searchOrders(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `ここ一カ月の注文を検索しています...` });
            const personService = new cinerinoapi.service.Person({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const searchOrdersResult = yield personService.searchOrders({
                orderDateFrom: moment(now)
                    .add(-1, 'month')
                    .toDate(),
                orderDateThrough: now,
                limit: 10,
                page: 1,
                sort: {
                    orderDate: cinerinoapi.factory.sortType.Descending
                }
            });
            const orders = searchOrdersResult.data;
            if (searchOrdersResult.data.length === 0) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '注文が見つかりませんでした' });
            }
            else {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '注文が見つかりました' });
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `直近の${orders.length}件は以下の通りです` });
                const contents = orders.map((order) => {
                    return contentsBuilder_1.order2flexBubble({ order });
                });
                const flex = {
                    type: 'flex',
                    altText: 'This is a Flex Message',
                    contents: {
                        type: 'carousel',
                        contents: contents
                    }
                };
                yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
            }
        });
    }
    /**
     * 注文照会
     */
    findOrderByConfirmationNumber(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `${params.confirmationNumber}で注文を検索しています...` });
            const orderService = new cinerinoapi.service.Order({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            let order;
            const orders = yield orderService.findByConfirmationNumber({
                confirmationNumber: String(params.confirmationNumber),
                customer: {
                    telephone: params.telephone
                }
            });
            if (Array.isArray(orders)) {
                order = orders[0];
            }
            if (order === undefined) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '注文が見つかりませんでした' });
                return;
            }
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: '注文が見つかりました' });
            const contents = [contentsBuilder_1.order2flexBubble({ order })];
            const flex = {
                type: 'flex',
                altText: 'This is a Flex Message',
                contents: {
                    type: 'carousel',
                    contents: contents
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
            // 発券メッセージ
            const message = {
                type: 'text',
                text: '下記対応が可能です',
                quickReply: {
                    items: [
                        {
                            type: 'action',
                            imageUrl: `https://${this.user.host}/img/labels/qr-code-48.png`,
                            action: {
                                type: 'postback',
                                label: '発券する',
                                data: qs.stringify({
                                    action: 'authorizeOwnershipInfosByOrder',
                                    amount: 100,
                                    orderNumber: order.orderNumber,
                                    telephone: params.telephone
                                })
                            }
                        }
                    ]
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [message]);
        });
    }
    /**
     * 注文発券
     */
    // tslint:disable-next-line:max-func-body-length
    authorizeOwnershipInfosByOrder(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `${params.orderNumber}に対して発券処理を実行します...` });
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'implementing...' });
            // const eventService = new cinerinoapi.service.Event({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: this.user.authClient,
            //     project: { id: this.project?.id }
            // });
            // const orderService = new cinerinoapi.service.Order({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: this.user.authClient,
            //     project: { id: this.project?.id }
            // });
            // const order = await orderService.authorizeOwnershipInfos({
            //     orderNumber: <any>params.orderNumber,
            //     customer: {
            //         telephone: params.telephone
            //     }
            // });
            // await LINE.pushMessage(this.user.userId, { type: 'text', text: 'コードが発行されました' });
            // const reservations = <cinerinoapi.factory.order.IReservation[]>order.acceptedOffers
            //     .filter((o) => o.itemOffered.typeOf === cinerinoapi.factory.chevre.reservationType.EventReservation)
            //     .map((o) => o.itemOffered);
            // const event = await eventService.findById<cinerinoapi.factory.chevre.eventType.ScreeningEvent>({
            //     id: reservations[0].reservationFor.id
            // });
            // const flex = reservations2Ticket({ reservations, event });
            // await LINE.pushMessage(this.user.userId, [flex]);
        });
    }
    /**
     * 予約コード読み込み
     */
    // tslint:disable-next-line:max-func-body-length
    findScreeningEventReservationById(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: 'コードを読み込んでいます...' });
            // const ownershipInfoService = new cinerinoapi.service.OwnershipInfo({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: this.user.authClient,
            //     project: { id: this.project?.id }
            // });
            // const reservationService = new cinerinoapi.service.Reservation({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: this.user.authClient,
            //     project: { id: this.project?.id }
            // });
            // const eventService = new cinerinoapi.service.Event({
            //     endpoint: <string>process.env.CINERINO_ENDPOINT,
            //     auth: this.user.authClient,
            //     project: { id: this.project?.id }
            // });
            try {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'implementing...' });
                // const { token } = await ownershipInfoService.getToken({ code: params.code });
                // const ownershipInfo = await reservationService.findScreeningEventReservationByToken({ token: token });
                // await LINE.pushMessage(this.user.userId, { type: 'text', text: '予約が見つかりました' });
                // const reservation = ownershipInfo.typeOfGood;
                // const event = await eventService.findById<cinerinoapi.factory.chevre.eventType.ScreeningEvent>({
                //     id: reservation.reservationFor.id
                // });
                // const flex = reservation2Ticket({ reservation, event });
                // await LINE.pushMessage(this.user.userId, [flex]);
            }
            catch (error) {
                yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: `Invalid code ${error.message}` });
            }
        });
    }
    /**
     * プロフィール検索
     */
    getProfile(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `プロフィールを検索しています...` });
            const personService = new cinerinoapi.service.Person({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            const profile = yield personService.getProfile({});
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'プロフィールが見つかりました' });
            const contents = [contentsBuilder_1.profile2bubble(profile)];
            const flex = {
                type: 'flex',
                altText: 'This is a Flex Message',
                contents: {
                    type: 'carousel',
                    contents: contents
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
        });
    }
    /**
     * プロフィール更新
     */
    updateProfile(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const personService = new cinerinoapi.service.Person({
                endpoint: process.env.CINERINO_ENDPOINT,
                auth: this.user.authClient,
                project: { id: (_a = this.project) === null || _a === void 0 ? void 0 : _a.id }
            });
            yield lineClient_1.default.replyMessage(params.replyToken, { type: 'text', text: `プロフィールを更新しています...` });
            yield personService.updateProfile(Object.assign({}, params.profile));
            yield lineClient_1.default.pushMessage(this.user.userId, { type: 'text', text: 'プロフィールを更新しました' });
            const contents = [contentsBuilder_1.profile2bubble(params.profile)];
            const flex = {
                type: 'flex',
                altText: 'This is a Flex Message',
                contents: {
                    type: 'carousel',
                    contents: contents
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [flex]);
        });
    }
    /**
     * 日付選択を求める
     */
    askEventStartDate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = {
                type: 'text',
                text: (typeof params.text === 'string' && params.text.length > 0) ? params.text : 'イベント日を選択してください',
                quickReply: {
                    items: [
                        {
                            type: 'action',
                            // imageUrl: `https://${user.host}/img/labels/coin-64.png`,
                            action: {
                                type: 'postback',
                                label: '今日',
                                data: qs.stringify({
                                    action: 'searchEventsByDate',
                                    date: moment()
                                        .add(0, 'days')
                                        .format('YYYY-MM-DD')
                                })
                            }
                        },
                        {
                            type: 'action',
                            // imageUrl: `https://${user.host}/img/labels/friend-pay-64.png`,
                            action: {
                                type: 'postback',
                                label: '明日',
                                data: qs.stringify({
                                    action: 'searchEventsByDate',
                                    date: moment()
                                        .add(1, 'days')
                                        .format('YYYY-MM-DD')
                                })
                            }
                        },
                        {
                            type: 'action',
                            // imageUrl: `https://${user.host}/img/labels/friend-pay-64.png`,
                            action: {
                                type: 'postback',
                                label: '明後日',
                                data: qs.stringify({
                                    action: 'searchEventsByDate',
                                    date: moment()
                                        // tslint:disable-next-line:no-magic-numbers
                                        .add(2, 'days')
                                        .format('YYYY-MM-DD')
                                })
                            }
                        },
                        {
                            type: 'action',
                            imageUrl: `https://${this.user.host}/img/labels/calender-48.png`,
                            action: {
                                type: 'datetimepicker',
                                label: '選ぶ',
                                mode: 'date',
                                data: 'action=searchEventsByDate',
                                initial: moment()
                                    .add(1, 'days')
                                    .format('YYYY-MM-DD'),
                                max: moment()
                                    // tslint:disable-next-line:no-magic-numbers
                                    .add(6, 'months')
                                    .format('YYYY-MM-DD'),
                                min: moment()
                                    .add(1, 'days')
                                    .format('YYYY-MM-DD')
                            }
                        }
                    ]
                }
            };
            yield lineClient_1.default.pushMessage(this.user.userId, [message]);
        });
    }
}
exports.PostbackWebhookController = PostbackWebhookController;
