var util = require('./util.js');

var Api = function(params) {
    this._params = params;

    this._auth = params.OAuthToken?
        'OAuth ' + params.OAuthToken :
        'Basic ' + new Buffer(params.login + ':' + params.password, 'utf8').toString('base64');
};

util.extend(Api.prototype, {
    _host : 'webdav.yandex.ru',
    _port : 443
}, require('./core'), require('./methods/webdav'));

module.exports = Api;
