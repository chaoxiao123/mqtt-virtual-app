'use strict';

module.exports = {
  properties: {
    productId: {
      type: 'string',
    },
    sn: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: ['OWN'],
    },
    accountId: {
      type: 'string',
    },
    token: {
      type: 'string',
    },
  },
  $async: true,
  required: ['productId', 'sn', 'type', 'accountId', 'token'],
  additionalProperties: false,
};
