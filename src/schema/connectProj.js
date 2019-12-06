'use strict';

module.exports = {
    properties: {
        masterKey: {
            type: 'string',
        },
        accessKey: {
            type: 'string',
        },
        projectId: {
            type: 'string',
        },
        url: {
            type: 'string',
        },
        productId: {
            type: 'string',
        },
        sn: {
            type: 'string',
        },
        token: {
            type: 'string',
        },
        accountId: {
            type: 'string',
        },
    },
    $async: true,
    required: ['productId', 'sn', 'token', 'accountId'],
    additionalProperties: false,
};
