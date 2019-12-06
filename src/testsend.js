'use strict';

const Application = require('./app');

const emqUrl = 'mqtt://172.19.3.182:1883'
const productId = ''
const sn = ''
const app = new Application(productId, sn, emqUrl);

// test connet

const masterKey = '5d365815107cd90036decd05'
const accessKey = 'AyxSBuoMmzZdqQPNFRwHLktb'
const url = 'http://www.onenetv3.com'
const projectId = 'KHLD3P'
const sid = 'YQ4E5Ju69'
const type = 'PROJ'
if (type === 'PROJ') {
    app.connectProj(url, masterKey, accessKey, projectId, sid)
} else {
    app.connectOwn(accountId, token)
}
console.log('111')
const params = {
    origin: 'industry',
    target: 'resource',
    functionId: 12289,
    data: {
        method: 'write',
        functionValue: false
    }
}
app.send(params)
