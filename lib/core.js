var PATH = require('path'),

    HTTP = require('http'),
    HTTPS = require('https'),

    Vow = require('vow'),
    util = require('./util');

module.exports = {

    /**
     * Отправляет запрос на сервер
     * @private
     * @param {String} method - метод запроса
     * @param {String} pathname - путь на сервере
     * @param {Object} [headers]
     * @param {Buffer|String} [body] - тело запроса
     * @param {String} [resEncoding=binary] - кодировка запроса
     * @returns {Vow.promise}
     */
    // FIXME: Больше кастромизации
    _request : function(method, pathname, headers, body, resEncoding) {

        headers || (headers = { });
        resEncoding || (resEncoding = 'binary');

        var promise = Vow.promise(),
            options = {
                // TODO: Конструировать querystring с помощью встроенного в node модуля qs
                host: this._host,
                port: this._port,
                method: method.toUpperCase(),
                path: encodeURI('/' + pathname),
                headers: {
                    'Host': this._host,
                    'Accept': '*/*',
                    'Authorization': this._auth
                }
            };

        body && (headers['Content-Length'] = body.length);

        var req = HTTPS.request(options, function(res) {
            var code = res.statusCode,
                data = '';

            // XXX: redirects?
            if(code >= 400) {
                return promise.reject(new HttpError(code));
            }

            res.setEncoding(resEncoding);

            res
                .on('data', function(chunk) {
                        data += chunk;
                })
                .once('close', function() {
                    promise.reject(new Error('Connection closed'));
                })
                .once('end', function() {
                    promise.fulfill(data);
                });
        });

        body && req.write(body, resEncoding);

        req.on('error', promise.reject);
        req.end();

        return promise;

    }

};


/**
 * Конструирует HTTP ошибку
 * @private
 * @param {Object} params - параметры ошибки
 * @returns {HTTPError}
 */
var HttpError = function(code) {
    this.code = code;
    this.message = HTTP.STATUS_CODES[code] || 'Unspecified Error';
};

util.extend(HttpError.prototype, Error.prototype, {
    toString : function() {
        return 'HttpError: ' + this.code + ', ' + this.message;
    }
});
