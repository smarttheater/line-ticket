"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * コンテンツビルダー
 */
const cinerinoapi = require("@cinerino/api-nodejs-client");
const moment = require("moment");
const qs = require("qs");
const util_1 = require("util");
// tslint:disable-next-line:max-func-body-length
function createConfirmOrderFlexBubble(params) {
    const seller = params.seller;
    const profile = params.profile;
    const tmpReservations = params.tmpReservations;
    const price = params.price;
    const bodyContents = [
        {
            type: 'text',
            text: '注文をご確認ください',
            weight: 'bold',
            color: '#1DB446',
            size: 'sm'
        },
        {
            type: 'text',
            text: seller.name.ja,
            weight: 'bold',
            size: 'xxl',
            margin: 'md',
            maxLines: 0,
            wrap: true
        },
        {
            type: 'text',
            text: (seller.telephone !== undefined) ? seller.telephone : 'Unknown telephone',
            size: 'xs',
            color: '#aaaaaa',
            wrap: true
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
                                    text: `${profile.givenName} ${profile.familyName}`,
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
                                    text: String(profile.email),
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
                                    text: String(profile.telephone),
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
                ...tmpReservations.map((tmpReservation) => {
                    var _a;
                    const item = tmpReservation;
                    const event = item.reservationFor;
                    const offerName = (typeof item.reservedTicket.ticketType.name === 'string')
                        ? item.reservedTicket.ticketType.name
                        : (_a = item.reservedTicket.ticketType.name) === null || _a === void 0 ? void 0 : _a.ja;
                    // tslint:disable-next-line:max-line-length no-unnecessary-local-variable
                    const str = (item.reservedTicket.ticketedSeat !== undefined)
                        ? `${item.reservedTicket.ticketedSeat.seatNumber} ${offerName}`
                        : '座席なし';
                    let priceStr = String(item.priceCurrency);
                    if (item.price !== undefined) {
                        if (typeof item.price === 'number') {
                            priceStr = `${item.price} ${item.priceCurrency}`;
                        }
                        else {
                            // tslint:disable-next-line:max-line-length
                            const unitPriceSpec = item.price.priceComponent.find(
                            // tslint:disable-next-line:max-line-length
                            (spec) => spec.typeOf === cinerinoapi.factory.chevre.priceSpecificationType.UnitPriceSpecification);
                            if (unitPriceSpec !== undefined) {
                                // tslint:disable-next-line:max-line-length
                                priceStr = `${unitPriceSpec.price}/${unitPriceSpec.referenceQuantity.value} ${item.priceCurrency}`;
                            }
                        }
                    }
                    return {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            {
                                type: 'box',
                                layout: 'vertical',
                                flex: 2,
                                contents: [
                                    {
                                        type: 'text',
                                        text: `${event.name.ja} ${moment(event.startDate)
                                            .format('MM/DD HH:mm')}`,
                                        size: 'xs',
                                        color: '#555555',
                                        wrap: true
                                    },
                                    {
                                        type: 'text',
                                        text: str,
                                        size: 'xs',
                                        color: '#aaaaaa'
                                    }
                                ]
                            },
                            {
                                type: 'text',
                                text: priceStr,
                                size: 'xs',
                                color: '#111111',
                                align: 'end',
                                flex: 1,
                                gravity: 'top'
                            }
                        ]
                    };
                }),
                {
                    type: 'separator',
                    margin: 'xxl'
                },
                {
                    type: 'box',
                    layout: 'horizontal',
                    margin: 'xxl',
                    contents: [
                        {
                            type: 'text',
                            text: 'ITEMS',
                            size: 'sm',
                            color: '#555555'
                        },
                        {
                            type: 'text',
                            text: `${tmpReservations.length}`,
                            size: 'sm',
                            color: '#111111',
                            align: 'end'
                        }
                    ]
                },
                {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                        {
                            type: 'text',
                            text: 'TOTAL',
                            size: 'sm',
                            color: '#555555'
                        },
                        {
                            type: 'text',
                            text: `${price} ${cinerinoapi.factory.priceCurrency.JPY}`,
                            size: 'sm',
                            color: '#111111',
                            align: 'end'
                        }
                    ]
                }
                // {
                //     type: 'box',
                //     layout: 'horizontal',
                //     contents: [
                //         {
                //             type: 'text',
                //             text: '決済方法',
                //             size: 'sm',
                //             color: '#555555'
                //         },
                //         {
                //             type: 'text',
                //             text: params.paymentMethodType,
                //             size: 'sm',
                //             color: '#111111',
                //             align: 'end'
                //         }
                //     ]
                // }
            ]
        }
    ];
    const body = {
        type: 'box',
        layout: 'vertical',
        contents: bodyContents
    };
    const contents = {
        type: 'bubble',
        styles: {
            footer: {
                separator: true
            }
        },
        body: body,
        footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
                {
                    type: 'button',
                    // flex: 2,
                    style: 'primary',
                    action: {
                        type: 'postback',
                        label: '注文確定',
                        data: `action=confirmOrder&transactionId=${params.id}`
                    }
                },
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: 'キャンセル',
                        data: `action=cancelOrder&transactionId=${params.id}`
                    }
                }
            ]
        }
    };
    return {
        type: 'flex',
        altText: 'This is a Flex Message',
        contents: contents
    };
}
exports.createConfirmOrderFlexBubble = createConfirmOrderFlexBubble;
// tslint:disable-next-line:max-func-body-length
function screeningEventSeries2flexBubble(params) {
    const event = params.event;
    const thumbnailImageUrl = (event.workPerformed.thumbnailUrl !== undefined
        && event.workPerformed.thumbnailUrl !== null)
        ? event.workPerformed.thumbnailUrl
        // tslint:disable-next-line:max-line-length
        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz';
    const body = {
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
                                text: 'Place',
                                color: '#aaaaaa',
                                size: 'sm',
                                flex: 1
                            },
                            {
                                type: 'text',
                                text: String(event.location.name.ja),
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
                                text: 'VideoFormat',
                                color: '#aaaaaa',
                                size: 'sm',
                                flex: 1
                            },
                            {
                                type: 'text',
                                text: (Array.isArray(event.videoFormat) && event.videoFormat.length > 0)
                                    ? event.videoFormat.map((f) => f.typeOf)
                                        .join(',')
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
                                text: 'Duration',
                                color: '#aaaaaa',
                                size: 'sm',
                                flex: 1
                            },
                            {
                                type: 'text',
                                text: (typeof event.duration === 'string')
                                    ? moment.duration(event.duration)
                                        .toISOString()
                                    : '---',
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
    };
    return {
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
        body: body,
        footer: {
            type: 'box',
            layout: 'horizontal',
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: 'スケジュール選択',
                        data: qs.stringify({
                            action: 'askScreeningEvent',
                            screeningEventSeriesId: event.id,
                            date: params.date
                        })
                    }
                }
            ]
        }
    };
}
exports.screeningEventSeries2flexBubble = screeningEventSeries2flexBubble;
// tslint:disable-next-line:max-func-body-length
function screeningEvent2flexBubble(params) {
    const event = params.event;
    const MAX_AVAILABILITY_SCORE = 5;
    const query = qs.stringify({ eventId: event.id, userId: params.user.userId });
    const selectSeatsUri = `/projects/${event.project.id}/transactions/placeOrder/selectSeatOffers?${query}`;
    const liffUri = `line://app/${process.env.LIFF_ID}?${qs.stringify({ cb: selectSeatsUri })}`;
    let availability = 100;
    if (event.maximumAttendeeCapacity !== undefined && event.remainingAttendeeCapacity !== undefined) {
        // tslint:disable-next-line:no-magic-numbers
        availability = Math.floor((event.remainingAttendeeCapacity / event.maximumAttendeeCapacity) * 100);
    }
    // tslint:disable-next-line:no-magic-numbers
    const availabilityScore = Math.floor(availability / Math.floor(100 / MAX_AVAILABILITY_SCORE));
    return {
        type: 'bubble',
        body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            contents: [
                {
                    type: 'text',
                    text: event.name.ja,
                    wrap: true,
                    weight: 'bold',
                    gravity: 'center',
                    size: 'xl'
                },
                {
                    type: 'box',
                    layout: 'baseline',
                    margin: 'md',
                    contents: [
                        ...(availabilityScore > 0)
                            // tslint:disable-next-line:prefer-array-literal
                            ? [...Array(availabilityScore)].map(() => {
                                return {
                                    type: 'icon',
                                    size: 'sm',
                                    url: `https://${params.user.host}/img/labels/theater-seat-blue-80.png`
                                };
                            })
                            : [],
                        ...(availabilityScore < MAX_AVAILABILITY_SCORE)
                            // tslint:disable-next-line:prefer-array-literal
                            ? [...Array(MAX_AVAILABILITY_SCORE - availabilityScore)].map(() => {
                                return {
                                    type: 'icon',
                                    size: 'sm',
                                    url: `https://${params.user.host}/img/labels/theater-seat-grey-80.png`
                                };
                            })
                            : [],
                        {
                            type: 'text',
                            text: `${availability}%`,
                            size: 'sm',
                            color: '#999999',
                            margin: 'md',
                            flex: 0
                        }
                    ]
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
                                    text: 'Place',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 1
                                },
                                {
                                    type: 'text',
                                    text: String(event.location.name.ja),
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
                                    text: 'Date',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 1
                                },
                                {
                                    type: 'text',
                                    text: moment(event.startDate)
                                        .format('YYYY-MM-DD'),
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
                                    text: 'Time',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 1
                                },
                                {
                                    type: 'text',
                                    text: `${moment(event.startDate)
                                        .format('HH:mm')} - ${moment(event.endDate)
                                        .format('HH:mm')}`,
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
        },
        footer: {
            type: 'box',
            layout: 'horizontal',
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'uri',
                        label: '座席選択',
                        uri: liffUri
                    }
                }
            ]
        }
    };
}
exports.screeningEvent2flexBubble = screeningEvent2flexBubble;
// tslint:disable-next-line:max-func-body-length
function order2flexBubble(params) {
    const order = params.order;
    return {
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
                    text: 'RECEIPT',
                    weight: 'bold',
                    color: '#1DB446',
                    size: 'sm'
                },
                {
                    type: 'text',
                    text: order.seller.name,
                    weight: 'bold',
                    size: 'xxl',
                    margin: 'md',
                    maxLines: 0,
                    wrap: true
                },
                {
                    type: 'text',
                    text: (order.seller.telephone !== undefined) ? order.seller.telephone : 'Unknown telephone',
                    size: 'xs',
                    color: '#aaaaaa',
                    wrap: true
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
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '注文番号',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: String(order.orderNumber),
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '注文日時',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: moment(order.orderDate)
                                        .format('llll'),
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '確認番号',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: String(order.confirmationNumber),
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'Status',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: String(order.orderStatus),
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        }
                    ]
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
                        // tslint:disable-next-line:max-func-body-length
                        ...order.acceptedOffers.map((orderItem) => {
                            var _a;
                            let itemName;
                            let itemDescription;
                            let priceStr = orderItem.priceCurrency.toString();
                            switch (orderItem.itemOffered.typeOf) {
                                case cinerinoapi.factory.chevre.reservationType.EventReservation:
                                    const item = orderItem.itemOffered;
                                    const event = item.reservationFor;
                                    itemName = util_1.format('%s %s', event.name.ja, moment(event.startDate)
                                        .format('MM/DD HH:mm'));
                                    const offerName = (typeof item.reservedTicket.ticketType.name === 'string')
                                        ? item.reservedTicket.ticketType.name
                                        : (_a = item.reservedTicket.ticketType.name) === null || _a === void 0 ? void 0 : _a.ja;
                                    // tslint:disable-next-line:max-line-length no-unnecessary-local-variable
                                    if (item.reservedTicket !== undefined) {
                                        if (item.reservedTicket.ticketedSeat !== undefined) {
                                            itemDescription = util_1.format('%s %s', item.reservedTicket.ticketedSeat.seatNumber, offerName);
                                        }
                                        else {
                                            itemDescription = util_1.format('%s %s', '座席なし', offerName);
                                        }
                                    }
                                    else {
                                        itemDescription = 'No Reserved Ticket';
                                    }
                                    if (orderItem.priceSpecification !== undefined) {
                                        const priceSpecification = orderItem.priceSpecification;
                                        // tslint:disable-next-line:max-line-length
                                        const unitPriceSpec = priceSpecification.priceComponent.find(
                                        // tslint:disable-next-line:max-line-length
                                        (spec) => spec.typeOf === cinerinoapi.factory.chevre.priceSpecificationType.UnitPriceSpecification);
                                        if (unitPriceSpec !== undefined) {
                                            // tslint:disable-next-line:max-line-length
                                            priceStr = `${unitPriceSpec.price}/${unitPriceSpec.referenceQuantity.value} ${unitPriceSpec.priceCurrency}`;
                                        }
                                        else {
                                            priceStr = 'No Unit Price Spec';
                                        }
                                    }
                                    else {
                                        priceStr = 'No Price Spec';
                                    }
                                    break;
                                default:
                                    itemName = (typeof orderItem.itemOffered.name === 'string')
                                        ? String(orderItem.itemOffered.name)
                                        : String(orderItem.itemOffered.typeOf);
                                    itemDescription = (typeof orderItem.itemOffered.description === 'string')
                                        ? String(orderItem.itemOffered.description)
                                        : 'no description';
                            }
                            return {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        flex: 2,
                                        contents: [
                                            {
                                                type: 'text',
                                                text: itemName,
                                                size: 'xs',
                                                color: '#555555',
                                                wrap: true
                                            },
                                            {
                                                type: 'text',
                                                text: itemDescription,
                                                size: 'xs',
                                                color: '#aaaaaa'
                                            }
                                        ]
                                    },
                                    {
                                        type: 'text',
                                        text: priceStr,
                                        size: 'xs',
                                        color: '#111111',
                                        align: 'end',
                                        flex: 1,
                                        gravity: 'top'
                                    }
                                ]
                            };
                        }),
                        {
                            type: 'separator',
                            margin: 'xxl'
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            margin: 'xxl',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ITEMS',
                                    size: 'sm',
                                    color: '#555555'
                                },
                                {
                                    type: 'text',
                                    text: String(order.acceptedOffers.length),
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end'
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'TOTAL',
                                    size: 'sm',
                                    color: '#555555'
                                },
                                {
                                    type: 'text',
                                    text: `${order.price} ${order.priceCurrency}`,
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'separator',
                    margin: 'xxl'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'md',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            margin: 'md',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'PAYMENT ID',
                                    size: 'xs',
                                    color: '#aaaaaa',
                                    flex: 0
                                },
                                {
                                    type: 'text',
                                    text: (order.paymentMethods.length > 0)
                                        ? (String(order.paymentMethods[0].paymentMethodId).length > 0)
                                            ? String(order.paymentMethods[0].paymentMethodId)
                                            : 'No ID'
                                        : '---',
                                    color: '#aaaaaa',
                                    size: 'xs',
                                    align: 'end'
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            margin: 'md',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ACCOUNT ID',
                                    size: 'xs',
                                    color: '#aaaaaa',
                                    flex: 0
                                },
                                {
                                    type: 'text',
                                    text: (order.paymentMethods.length > 0)
                                        ? (String(order.paymentMethods[0].accountId).length > 0)
                                            ? String(order.paymentMethods[0].accountId)
                                            : 'No ID'
                                        : '---',
                                    color: '#aaaaaa',
                                    size: 'xs',
                                    align: 'end'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };
}
exports.order2flexBubble = order2flexBubble;
// tslint:disable-next-line:max-func-body-length
function creditCard2flexBubble(params) {
    const creditCard = params.creditCard;
    return {
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
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                        {
                            type: 'icon',
                            url: `https://${params.user.host}/img/labels/credit-card-64.png`
                        },
                        {
                            type: 'text',
                            text: (creditCard.cardName.length > 0) ? creditCard.cardName : 'Unknown Card Name',
                            wrap: true,
                            weight: 'bold',
                            margin: 'sm',
                            gravity: 'center',
                            size: 'xl'
                        }
                    ]
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
                                    text: 'HolderName',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: creditCard.holderName,
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
                                    text: 'CarNo',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: creditCard.cardNo,
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
                                    text: 'Expire',
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: creditCard.expire,
                                    wrap: true,
                                    color: '#666666',
                                    size: 'sm',
                                    flex: 4
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
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: '削除',
                        data: `action=deleteCreditCard&cardSeq=${creditCard.cardSeq}`
                    }
                },
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: 'コード発行',
                        data: `action=publishCreditCardToken&cardSeq=${creditCard.cardSeq}`
                    }
                }
            ]
        }
    };
}
exports.creditCard2flexBubble = creditCard2flexBubble;
// tslint:disable-next-line:max-func-body-length
function account2flexBubble(params) {
    const ownershipInfo = params.ownershipInfo;
    const account = ownershipInfo.typeOfGood;
    return {
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
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                        {
                            type: 'icon',
                            url: `https://${params.user.host}/img/labels/coin-64.png`
                        },
                        {
                            type: 'text',
                            text: account.accountNumber,
                            wrap: true,
                            weight: 'bold',
                            margin: 'sm',
                            gravity: 'center',
                            size: 'xl'
                        }
                    ]
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
                                    flex: 5
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
                                    flex: 5
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
                                    flex: 5
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
                                    flex: 5
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
                                    flex: 5
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
                                    flex: 5
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
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: '取引履歴確認',
                        data: qs.stringify({
                            action: 'searchAccountMoneyTransferActions',
                            accountType: cinerinoapi.factory.accountType.Coin,
                            accountNumber: account.accountNumber
                        })
                    }
                },
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: 'クレジットカードで入金',
                        data: qs.stringify({
                            action: 'selectDepositAmount',
                            accountType: cinerinoapi.factory.accountType.Coin,
                            accountNumber: account.accountNumber
                        })
                    }
                },
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: 'コード発行',
                        data: qs.stringify({
                            action: 'authorizeOwnershipInfo',
                            goodType: ownershipInfo.typeOfGood.typeOf,
                            id: ownershipInfo.id
                        })
                    }
                },
                // {
                //     type: 'button',
                //     action: {
                //         type: 'message',
                //         label: 'おこづかいをもらう',
                //         text: 'おこづかい'
                //     }
                // },
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: '解約',
                        data: qs.stringify({
                            action: 'closeAccount',
                            accountType: account.accountType,
                            accountNumber: account.accountNumber
                        })
                    }
                }
            ]
        }
    };
}
exports.account2flexBubble = account2flexBubble;
// tslint:disable-next-line:max-func-body-length
function moneyTransferAction2flexBubble(params) {
    const a = params.action;
    let actionName = '---';
    switch (a.purpose.typeOf) {
        case cinerinoapi.factory.pecorino.transactionType.Withdraw:
            actionName = '出金';
            break;
        case cinerinoapi.factory.pecorino.transactionType.Transfer:
            actionName = '転送';
            break;
        case cinerinoapi.factory.pecorino.transactionType.Deposit:
            actionName = '入金';
            break;
        default:
    }
    return {
        type: 'bubble',
        // styles: {
        //     footer: {
        //         separator: true
        //     }
        // },
        body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            contents: [
                {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                        {
                            type: 'icon',
                            url: `https://${params.user.host}/img/labels/coin-64.png`
                        },
                        {
                            type: 'text',
                            text: actionName,
                            wrap: true,
                            weight: 'bold',
                            margin: 'sm',
                            gravity: 'center',
                            size: 'xl'
                        }
                    ]
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
                                    text: 'Date',
                                    wrap: true,
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: moment(a.endDate)
                                        .format('YY.MM.DD HH:mm'),
                                    wrap: true,
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
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
                                    text: 'Amount',
                                    wrap: true,
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: String(a.amount),
                                    wrap: true,
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            spacing: 'sm',
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'sm',
                                    spacing: 'sm',
                                    flex: 2,
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'From',
                                            wrap: true,
                                            color: '#aaaaaa',
                                            size: 'sm'
                                        }
                                    ]
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'sm',
                                    spacing: 'sm',
                                    flex: 5,
                                    contents: [
                                        {
                                            type: 'text',
                                            text: (typeof a.fromLocation.name === 'string'
                                                && a.fromLocation.name.length > 0)
                                                ? a.fromLocation.name
                                                : '---',
                                            wrap: true,
                                            size: 'sm',
                                            color: '#666666'
                                        },
                                        {
                                            type: 'text',
                                            text: (typeof a.fromLocation.accountNumber === 'string')
                                                ? a.fromLocation.accountNumber
                                                : '---',
                                            wrap: true,
                                            size: 'sm',
                                            color: '#666666'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            spacing: 'sm',
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'sm',
                                    spacing: 'sm',
                                    flex: 2,
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'To',
                                            wrap: true,
                                            color: '#aaaaaa',
                                            size: 'sm'
                                        }
                                    ]
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'sm',
                                    spacing: 'sm',
                                    flex: 5,
                                    contents: [
                                        {
                                            type: 'text',
                                            text: (typeof a.toLocation.name === 'string' && a.toLocation.name.length > 0)
                                                ? a.toLocation.name
                                                : '---',
                                            wrap: true,
                                            size: 'sm',
                                            color: '#666666'
                                        },
                                        {
                                            type: 'text',
                                            text: (typeof a.toLocation.accountNumber === 'string')
                                                ? a.toLocation.accountNumber
                                                : '---',
                                            wrap: true,
                                            size: 'sm',
                                            color: '#666666'
                                        }
                                    ]
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
                                    text: 'Description',
                                    wrap: true,
                                    color: '#aaaaaa',
                                    size: 'sm',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: (typeof a.description === 'string' && a.description.length > 0)
                                        ? a.description
                                        : '---',
                                    wrap: true,
                                    color: '#666666',
                                    size: 'sm',
                                    flex: 5
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };
}
exports.moneyTransferAction2flexBubble = moneyTransferAction2flexBubble;
// tslint:disable-next-line:max-func-body-length
function reservation2flexBubble(params) {
    var _a;
    const ownershipInfo = params.ownershipInfo;
    const itemOffered = ownershipInfo.typeOfGood;
    const event = itemOffered.reservationFor;
    const thumbnailImageUrl = (event.workPerformed !== undefined
        && event.workPerformed.thumbnailUrl !== undefined
        && event.workPerformed.thumbnailUrl !== null)
        ? event.workPerformed.thumbnailUrl
        // tslint:disable-next-line:max-line-length
        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhpsOJOcLBwc1SPD9sWlinildy4S05-I2Wf6z2wRXnSxbmtRz';
    return {
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
                                        ? itemOffered.reservedTicket.ticketType.name
                                        : String((_a = itemOffered.reservedTicket.ticketType.name) === null || _a === void 0 ? void 0 : _a.ja),
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
                                        : 'No reservedTicket.underName',
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
                        }
                    ]
                }
            ]
        },
        footer: {
            type: 'box',
            layout: 'horizontal',
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'postback',
                        label: 'コード発行',
                        data: qs.stringify({
                            action: 'authorizeOwnershipInfo',
                            goodType: ownershipInfo.typeOfGood.typeOf,
                            id: ownershipInfo.id
                        })
                    }
                }
            ]
        }
    };
}
exports.reservation2flexBubble = reservation2flexBubble;
// tslint:disable-next-line:max-func-body-length
function profile2bubble(params) {
    return {
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
                    text: 'PROFILE',
                    weight: 'bold',
                    color: '#1DB446',
                    size: 'sm'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'xxl',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '姓',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: (params.familyName !== '') ? String(params.familyName) : 'Unknown',
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '名',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: (params.givenName !== '') ? String(params.givenName) : 'Unknown',
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'Eメール',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: (params.email !== '') ? String(params.email) : 'Unknown',
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'TEL',
                                    size: 'sm',
                                    color: '#aaaaaa',
                                    flex: 2
                                },
                                {
                                    type: 'text',
                                    text: (params.telephone !== '') ? String(params.telephone) : 'Unknown',
                                    size: 'sm',
                                    color: '#666666',
                                    flex: 5
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };
}
exports.profile2bubble = profile2bubble;
