'use strict';
const validate = require('validate');
const VirApplication = require('./lib/application');
const init = new VirApplication();

/**
 * application
 *
 * @class Application
 * @extends {Application}
 */
class Application {

  /**
    *
    * @memberof Application
    */
  constructor(productId, sn, emqUrl) {
    this.productId = productId
    this.sn = sn
    this.emqUrl = emqUrl
  }

  /**
   * app connect
   * @param {String}  params       - url, masterKey, accessKey, projectId, sid
   * @memberof Application
   */
  async connectProj (masterKey, accessKey, url, projectId, sid) {
    const errors = validate('schema.conncetProj', params)
    console.log('errors1', errors)
    const masterToken = await init.getEncode(masterKey, accessKey);
    const token = await init.getToken(url, { projectId, token: masterToken });
    if (typeof token === 'string') {
      await init.connectEmq(this.emqUrl, { sid, token });
    } else {
      console.log('token error-xxxxxxxxxx')
    }
  }

  /**
   * app connect
   * @param {String}  params       - accountId, account token
   * @memberof Application
   */
  async connectOwn (accountId, token) {
    const errors = validate('schema.conncetOwn', data)
    console.log('errors2', errors)
    await init.connectEmq(this.emqUrl, { accountId, token });
  }
  /**
   * app disconnect
   *
   * @memberof Application
   */
  async disconnect () {
    await init.disconnectEmq();
  }


  /**
   * app send order
   *
   * @memberof Application
   */
  async send (params) {
    const errors = validate('schema.send', params)
    console.log('send-error', errors)
    await init.sendCommand(params);
  }
}

module.exports = Application;
