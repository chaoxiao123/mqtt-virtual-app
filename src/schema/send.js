'use strict';

module.exports = {
    title: 'application order request schema',
    type: 'object',
    properties: {
        productId: {
            type: 'string',
        },
        sn: {
            type: 'string',
        },
        functionId: {
            type: 'number',
        },
        origin: {
            type: 'string',
            enum: ['industry', 'tmall', 'dueros', 'rokid', 'hewu'],
        },
        target: {
            type: 'string',
            enum: ['resource', 'system'],
        },
        data: {
            type: 'object',
            properties: {
                method: {
                    type: 'string',
                    enum: ['read', 'write', 'init', 'reset', 'recovery'],
                },
                groupId: {
                    type: 'number',
                },
                functionValue: {
                    anyOf: [{
                        type: 'string',
                    },
                    {
                        type: 'boolean',
                    },
                    {
                        type: 'number',
                    },
                    {
                        type: 'integer',
                    },
                    ],
                },
                option: {
                    type: 'object',
                },
            },
            required: ['method'],
        },
    },
    required: ['productId', 'sn', 'origin', 'target', 'data'],
    $async: true,
    additionalProperties: false,
};
