/**
 * LINE webhook messageコントローラー
 */
import * as cinerinoapi from '@cinerino/api-nodejs-client';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as querystring from 'querystring';
import * as request from 'request-promise-native';
import * as util from 'util';

import * as LINE from '../../../line';
import User from '../../user';

const debug = createDebug('cinerino-line-ticket:*');

/**
 * 使い方を送信する
 */
export async function pushHowToUse(userId: string) {
    await request.post({
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
                                label: '座席予約管理',
                                text: '座席予約'
                            },
                            {
                                type: 'message',
                                label: 'クレジットカード管理',
                                text: 'クレジットカード'
                            },
                            {
                                type: 'message',
                                label: 'コイン口座管理',
                                text: 'コイン'
                            },
                            {
                                type: 'message',
                                label: 'おこづかいをもらう',
                                text: 'おこづかい'
                            }
                            // {
                            //     type: 'message',
                            //     label: '顔を登録する',
                            //     text: '顔写真登録'
                            // }
                        ]
                    }
                }
            ]
        }
    }).promise();
}

/**
 * 座席予約メニューを表示する
 */
export async function showSeatReservationMenu(user: User) {
    await request.post({
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
            ]
        }
    }).promise();
}
export async function showCreditCardMenu(user: User) {
    const inputCreditCardUri = '/transactions/inputCreditCard?gmoShopId=tshop00026096';
    await request.post({
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
            ]
        }
    }).promise();
}
export async function showCoinAccountMenu(user: User) {
    await request.post({
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
                                type: 'postback',
                                label: '口座開設',
                                data: 'action=openCoinAccounts'
                            },
                            {
                                type: 'postback',
                                label: '口座検索',
                                data: 'action=searchCoinAccounts'
                            }
                        ]
                    }
                }
            ]
        }
    }).promise();
}
/**
 * 顔写真登録を開始する
 */
export async function startIndexingFace(userId: string) {
    const text = '顔写真を送信してください。';

    await LINE.pushMessage(userId, text);
}

/**
 * 友達決済承認確認
 */
export async function askConfirmationOfFriendPay(user: User, token: string) {
    await request.post({
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
}

/**
 * おこづかい承認確認
 */
export async function askConfirmationOfTransferMoney(user: User, transferMoneyToken: string) {
    const transferMoneyInfo = await user.verifyTransferMoneyToken(transferMoneyToken);

    await request.post({
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
}

/**
 * 誰からお金をもらうか選択する
 */
export async function selectWhomAskForMoney(user: User) {
    const LINE_ID = process.env.LINE_ID;
    const personService = new cinerinoapi.service.Person({
        endpoint: <string>process.env.CINERINO_ENDPOINT,
        auth: user.authClient
    });
    let accounts = await personService.searchAccounts({ personId: 'me', accountType: cinerinoapi.factory.accountType.Coin })
        .then((ownershiInfos) => ownershiInfos.map((o) => o.typeOfGood));
    accounts = accounts.filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
    debug('accounts:', accounts);
    if (accounts.length === 0) {
        throw new Error('口座未開設です');
    }
    const account = accounts[0];
    const contact = await personService.getContacts({ personId: 'me' });

    const token = await user.signTransferMoneyInfo({
        userId: user.userId,
        accountNumber: account.accountNumber,
        name: `${contact.familyName} ${contact.givenName}`
    });
    const friendMessage = `TransferMoneyToken.${token}`;
    const message = encodeURIComponent(`おこづかいちょーだい！
よければ下のリンクを押してそのままメッセージを送信してね。
line://oaMessage/${LINE_ID}/?${friendMessage}`);

    await request.post({
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
}

/**
 * 予約番号or電話番号のボタンを送信する
 */
export async function pushButtonsReserveNumOrTel(userId: string, message: string) {
    debug(userId, message);
    const datas = message.split('-');
    const theater = datas[0];
    const reserveNumOrTel = datas[1];

    // キュー実行のボタン表示
    await request.post({
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
}

/**
 * 予約のイベント日選択を求める
 */
export async function askReservationEventDate(userId: string, paymentNo: string) {
    await request.post(
        'https://api.line.me/v2/bot/message/push',
        {
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId, // 送信相手のuserId
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
        }
    ).promise();
}
export async function searchAccountTradeActions(user: User) {
    const personService = new cinerinoapi.service.Person({
        endpoint: <string>process.env.CINERINO_ENDPOINT,
        auth: user.authClient
    });
    let accounts = await personService.searchAccounts({ personId: 'me', accountType: cinerinoapi.factory.accountType.Coin })
        .then((ownershiInfos) => ownershiInfos.map((o) => o.typeOfGood));
    accounts = accounts.filter((a) => a.status === cinerinoapi.factory.pecorino.accountStatusType.Opened);
    debug('accounts:', accounts);
    if (accounts.length === 0) {
        throw new Error('口座未開設です');
    }
    const account = accounts[0];
    let transferActions = await personService.searchAccountMoneyTransferActions({
        personId: 'me',
        accountType: cinerinoapi.factory.accountType.Coin,
        accountNumber: account.accountNumber
    });

    if (transferActions.length === 0) {
        await LINE.pushMessage(user.userId, 'まだ取引履歴はありません。');

        return;
    }

    // tslint:disable-next-line:no-magic-numbers
    transferActions = transferActions.slice(0, 10);

    const actionsStr = transferActions.map(
        (a) => {
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

            return util.format(
                '●%s %s %s %s\n⇐ %s\n[%s]\n⇒ %s\n[%s]\n@%s',
                ((<any>a.fromLocation).accountNumber === (<any>account).accountNumber) ? '出' : '入',
                moment(a.endDate).format('YY.MM.DD HH:mm'),
                actionName,
                `${a.amount}P`,
                a.fromLocation.name,
                ((<any>a.fromLocation).accountNumber !== undefined) ? (<any>a.fromLocation).accountNumber : '',
                a.toLocation.name,
                ((<any>a.toLocation).accountNumber !== undefined) ? (<any>a.toLocation).accountNumber : '',
                (a.description !== undefined) ? a.description : ''
            );
        }
    ).join('\n');

    await LINE.pushMessage(
        user.userId,
        actionsStr
    );
}

/**
 * 日付選択を求める
 */
export async function askEventStartDate(userId: string) {
    await request.post(
        'https://api.line.me/v2/bot/message/push',
        {
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId, // 送信相手のuserId
                messages: [
                    {
                        type: 'text', // ①
                        text: '上映日を選択してください',
                        quickReply: { // ②
                            items: [
                                {
                                    type: 'action', // ③
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
                                    type: 'action', // ③
                                    // imageUrl: `https://${user.host}/img/labels/friend-pay-64.png`,
                                    action: {
                                        type: 'postback',
                                        label: '明日',
                                        data: querystring.stringify({
                                            action: 'searchEventsByDate',
                                            date: moment().add(1, 'days').format('YYYY-MM-DD')
                                        })
                                    }
                                }
                                // {
                                //     type: 'datetimepicker',
                                //     label: '日付選択',
                                //     mode: 'date',
                                //     data: 'action=searchEventsByDate',
                                //     initial: moment().add(1, 'days').format('YYYY-MM-DD'),
                                //     // tslint:disable-next-line:no-magic-numbers
                                //     max: moment().add(2, 'days').format('YYYY-MM-DD'),
                                //     min: moment().add(1, 'days').format('YYYY-MM-DD')
                                // }
                            ]
                        }
                    }
                ]
            }
        }
    ).promise();
}

/**
 * 日付選択を求める
 */
export async function askFromWhenAndToWhen(userId: string) {
    // await LINE.pushMessage(userId, '期間をYYYYMMDD-YYYYMMDD形式で教えてください。');
    await request.post(
        'https://api.line.me/v2/bot/message/push',
        {
            auth: { bearer: process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
            json: true,
            body: {
                to: userId, // 送信相手のuserId
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
        }
    ).promise();
}

export async function logout(user: User) {
    const logoutUri = `https://${user.host}/logout?userId=${user.userId}`;
    const liffUri = `line://app/${process.env.LIFF_ID}?${querystring.stringify({ cb: logoutUri })}`;
    await request.post({
        simple: false,
        url: LINE.URL_PUSH_MESSAGE,
        auth: { bearer: <string>process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN },
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
                                uri: liffUri
                            }
                        ]
                    }
                }
            ]
        }
    }).promise();
}
