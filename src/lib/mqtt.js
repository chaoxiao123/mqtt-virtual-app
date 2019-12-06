'use strict'

const assert = require('assert')
const mqtt = require('mqtt')
const fs = require('fs')
const path = require('path')

/**
 * mqtt客户端
 *
 * @class Mqtt
 */
class Mqtt {
    /**
     * 创建Mqtt实例
     * @memberof VirtualDevice
     */
    constructor(logger, loggerPrefix) {
        this.logger = logger
        this.loggerPrefix = loggerPrefix
        this.isConnected = false
    }

    // /**
    //  * mqtt logger
    //  *
    //  * @readonly
    //  * @memberof Mqtt
    //  */
    // get logger () {
    //     return new Proxy(this.logger, {
    //         get (target, property) {
    //             if (Reflect.has(target, property)) return target[property].bind(target)
    //         }
    //     })
    // }

    /**
     * mqtt client
     *
     * @param {String}  url       - mqtt url地址
     * @param {Object}  options   - mqtt connect option
     * @memberof Mqtt
     * @return {Object} client
     */
    async client (url, options) {
        assert(typeof url === 'string', '[Mqtt][client] - url需为字符串')
        assert(typeof options === 'object', '[Mqtt][client] - options需为对象')

        const maxReconnectTimes = 0
        let reconnectTimes = 0
        let optionData = {}
        if (url.slice(0, 5) === 'mqtts') {
            const CERT = fs.readFileSync(path.join(__dirname, '../public/cert.pem'));
            optionData = Object.assign({}, options, {
                protocol: 'mqtts',
                ca: CERT,
                rejectUnauthorized: false
            })
        } else {
            optionData = options
        }
        const mqttClient = mqtt.connect(url, optionData)
        return new Promise((resolve, reject) => {
            mqttClient.on('connect', packet => {
                this.client = mqttClient
                this.isConnected = true
                // this.logger.info(`[Mqtt][client] - mqtt connect success, packet: ${packet}`)
                if (this.loggerPrefix.includes('[VirtualApplication]')) {
                    console.log('mqtt success')
                }
                resolve(mqttClient)
            })

            mqttClient.on('error', error => {
                this.isConnected = false
                reject(new Error(`[Mqtt][client] - ${error}`))
            })

            mqttClient.on('reconnect', () => {
                if (reconnectTimes < maxReconnectTimes) reconnectTimes++
                else {
                    reconnectTimes = 0
                    mqttClient.end()
                    // this.logger.info(`${this.loggerPrefix}[Mqtt][client] - passive disconnected `)
                }
            })

            mqttClient.on('end', () => {
                this.isConnected = false
                if (this.loggerPrefix.includes('[VirtualApplication]')) {
                    console.log('mqtt error')
                }
                // this.logger.info(`${this.loggerPrefix}[Mqtt][client] - client closed`)
            })
        })
    }

    /**
     * mqtt msg consumer
     *
     * @param {String}   topic      - mqtt topic
     * @param {Objcet}   options    - mqtt subscribe options
     * @param {Function} callback   - mqtt message handler
     * @memberof Mqtt
     */
    async msgConsumer (topic, options, callback) {
        assert(topic && (typeof topic === 'string' || (typeof topic === 'object' && topic.length > 0)), '[Mqtt][msgConsumer] - topic类型错误')
        if (options) {
            assert(
                ['object', 'function'].includes(typeof options),
                '[Mqtt][msgConsumer] - options类型错误'
            )
            if (typeof options === 'function') callback = options
        }
        if (callback) assert(typeof callback === 'function', '[Mqtt][msgConsumer] - callback类型错误')

        this.client.subscribe(topic, options, (err, granted) => {
            if (err) {
                // this.logger.info(  `${this.loggerPrefix}[Mqtt][msgConsumer] - consumer subscribe failed: ${err}`)
                return
            }

            // this.logger.info(`${this.loggerPrefix}[Mqtt][msgConsumer] - consumer subscribe success, granted: ${JSON.stringify(granted)}`)
            if (this.loggerPrefix.includes('[VirtualMQ]')) {
                const msg = Object.assign(granted[0], { dataTime: Date.now() })
                console.log('mqtt success User/saveSuback', JSON.stringify(msg))
            }
            this.client.on('message', async (topic, message, packet) => {
                const msg = typeof options === 'object' ? await this.pullToMQ(message) : message
                // this.logger.info(`[Mqtt][msgConsumer] - 收到消息，topic：${topic}, msg: ${msg.toString()}`)
                if (callback) callback(topic, msg, packet)
            })
        })
    }

    /**
     * mqtt msg publisher
     *
     * @param {String}          topic    - publisher topic
     * @param {Buffer|String}   msg      - publisher message
     * @param {Object}          options  - publisher options
     * @param {Function}        callback - publiusher callback
     * @memberof Mqtt
     */
    async msgPublisher (topic, msg, options, callback) {
        assert(topic && typeof topic === 'string', '[Mqtt][msgPublisher] - topic类型错误')
        assert(
            (msg && typeof msg === 'string') || Buffer.isBuffer(msg),
            '[Mqtt][msgPublisher] - msg类型错误'
        )

        if (options) {
            assert(
                ['object', 'function'].includes(typeof options),
                '[Mqtt][msgPublisher] - options类型错误'
            )
            if (typeof options === 'function') callback = options
        }
        if (callback) assert(typeof callback === 'function', '[Mqtt][msgPublisher] - callback类型错误')

        this.client.publish(topic, msg, options, err => {
            // if (err) {
            //     this.logger.info(`${this.loggerPrefix}[Mqtt][msgPublisher] - message发送失败: ${err}`)
            // }
            // this.logger.info(`[Mqtt][msgPublisher] - message send success，topic：${topic}，msg: ${msg}`)
            if (callback) callback()
        })
    }

    /**
     * close mqtt connection
     *
     * @param {Boolean}  force    - close the client right away
     * @param {Object}   options  - options of disconnect
     * @memberof Mqtt
     * @return {Promise}  msg and reqid
     */
    async closeClient (force = true) {
        return new Promise(resolve => {
            this.client.end(force, () => {
                resolve()
            })
        })
    }
}

module.exports = Mqtt
