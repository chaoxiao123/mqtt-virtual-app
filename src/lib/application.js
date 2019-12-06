'use strict';
const Mqtt = require('./mqtt');
const assert = require('assert');
const uuid = require('uuid');
const crypto = require('crypto');
const log4js = require('log4js');
const axios = require('axios')
/**
 * Virtual application functions
 *
 * @class VirtualApplication
 */
class VirtualApplication {
    /**
     *
     * @memberof VirtualApplication
     */
    constructor(productId, sn) {
        this.message = {};
        this.mqtt = null;
        this.isEmqConnected = false;
        this.logger = log4js.getLogger();
        this.logger.level = 'info'
        this.productId = productId
        this.sn = sn
    }

    // /**
    //  * VirtualApplication logger
    //  *
    //  * @readonly
    //  * @memberof VirtualApplication
    //  */
    // get logger () {
    //     return new Proxy(this.logger, {
    //         get (target, property) {
    //             if (Reflect.has(target, property)) return target[property].bind(target);
    //         },
    //     });
    // }

    /**
     * Application connect and subscribe
     * If it is the device of the project, params is sid and masterkey token. but params is account_id and user token.
     * 
     * @param {String} url          - emqtt url
     * @param {String} params       - username and password and type('PROJ'/'OWN') and product id and device sn
     * @memberof VirtualApplication
     */
    async connectEmq (url, params) {
        assert(typeof params === 'object', '[VirtualApplication][connectEmq]- params must be an object');
        assert(params.type === 'PROJ' || params.type === 'OWN', '[VirtualApplication][connectEmq] - params type must be "PROJ" or "OWN"');

        const mqtt = new Mqtt(this.logger, '[VirtualApplication][connectEmq]');
        const topic = `client/products/${this.productId}/devices/${this.sn}/status`;

        const options = params.type === 'PROJ' ? {
            username: params.sid,
            password: params.token,
            clientId: uuid(),
        } : {
                username: params.accountId,
                password: params.token,
                clientId: 'product_' + uuid(),
            };
        await mqtt.client(url, options);
        if (mqtt.isConnected) this.isEmqConnected = true;
        // this.logger.info(
        //     `[VirtualApplication][connectEmq] - ${this.productId}_${this.sn}, saas broker connected`
        // );
        this.mqtt = mqtt;
        const self = this;
        mqtt.msgConsumer(topic, (topic, message) => {
            const msg = JSON.stringify(message.toString()).replace(new RegExp('\\\\"', 'gm'), '"')
            // this.logger.info(
            //     `[VirtualApplication][connectEmq] - ${productId}_${devKey}, received，topic：${topic}，msg: ${JSON.stringify(msg)}`
            // )
            let msgData = JSON.parse(JSON.parse(JSON.stringify(msg)))
            self.message = Object.assign({}, msgData)
        })
    }

    /**
     * Disconnect emqtt
     *
     * @memberof VirtualApplication
     */
    async disconnectEmq () {
        if (this.isEmqConnected) {
            await this.mqtt.closeClient(true);
            this.logger.info(
                '[VirtualApplication][disconnectEmq] - emq broker disconnected'
            );
        }
    }

    /**
     * Application issue instructions (settings and queries)
     *
     * @param {Object} params       - loading
     * @memberof VirtualApplication
     */
    async sendCommand (params) {
        assert(this.mqtt, '[VirtualApplication][sendCommand] - 未连接mqtt服务器');
        assert(typeof params === 'object', '[VirtualApplication][sendCommand]- 载荷须为对象');

        const topic = `client/products/${this.productId}/devices/${
            this.sn
            }/command`;
        const { origin, target, data, functionId } = params;
        const payloads = {
            version: '1.0.0',
            id: uuid(),
            productId: this.productId,
            devKey: this.sn,
            origin,
            target: target || 'resource',
        };
        if (data.method === 'read') {
            payloads.data = {
                method: 'read',
                params: functionId,
            };
        } else if (data.params) {
            payloads.data = {
                method: 'write',
                groupId: functionId,
                params: data.params,
            };
        } else {
            payloads.data = {
                method: 'write',
                params: { [functionId]: data.functionValue },
            };
        }
        await this.mqtt.msgPublisher(topic, JSON.stringify(payloads), () => { });
    }

    /**
    * 获取交换Token
    *
    * @param {String}  url          - url
    * @param {String}  params       - project-id and key
    * @memberof VirtualApplication
    * @return {Object} masterToken
    */
    async getToken (url, params) {
        assert(url && typeof url === 'string', '[VirtualApplication][getToken] - url error');
        assert(params && typeof params === 'object', '[VirtualApplication][getToken] - param error');

        console.log('url, params', url, params)
        const prefix = url + '/industry/open-api';

        const headers = {
            'project-id': params.projectId,
            'confirm-code': params.token,
        };
        const ret = await axios.get(`${prefix}/v1/sys/auth`, {
            headers,
            responseType: 'json'
        });
        if (ret && ret.data && ret.data.code === 200) {
            // this.logger.info(
            //     '[VirtualApplication][getToken] - get mastertoken success'
            // );
            return ret.data.data.token;
        }
        // this.logger.error(
        //     `[VirtualApplication][getToken] - get token error, params: ${params}`
        // );
        if (!ret.data) {
            return `get token error , params: ${params}`;
        }
        return ret.data;
    }


    /**
      * Key Encode
      *
      * @param {String}  msg       - msg
      * @param {String}  accessKey - accessKey-token
      * @memberof VirtualApplication
      * @return {Object} device list
      */
    async getEncode (msg, accessKey) {
        const random = Math.random().toString().slice(3, 8);
        const cipher = crypto.createCipher('aes-128-ecb', accessKey);
        let encodeMsg = cipher.update(`${msg}${random}${new Date().getTime()}`, 'utf8', 'hex');
        encodeMsg += cipher.final('hex');
        return encodeMsg;
    }

}

module.exports = VirtualApplication;
