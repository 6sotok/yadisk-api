var PATH = require('path'),
    HTTPS = require('https'),
    Vow = require('vow');

var hasOwn = Object.prototype.hasOwnProperty;

module.exports = {
    /**
     * HTTP коды ошибок
     * @private
     * @type {Object}
     */
    _errors : {
        '401' : 'Auth Error',
        '404' : 'Not Found',
        '409' : 'Conflict',
        '413' : 'Entity too large',
        '507' : 'Insufficient Storage'
    },

    /**
     * Отправляет запрос на сервер
     * @private
     * @param {String} method - метод запроса
     * @param {String} pathname - путь на сервере
     * @param {Object} headers
     * @param {Buffer|String} [body] - тело запроса
     * @param {String} [responseEncoding=binary] - кодировка запроса
     * @returns {Vow.promise}
     */
    _request : function(method, pathname, headers, body, responseEncoding) {

        responseEncoding || (responseEncoding = 'binary');

        var promise = Vow.promise(),
            errors = this._errors,
            createHTTPError = this._createHTTPError,
            options = {
                host: this._host,
                port: this._port,
                method: method.toUpperCase(),
                path: encodeURI(PATH.resolve('/', pathname)),
                headers: {
                    'Host': this._host,
                    'Accept': '*/*',
                    'Authorization': this._auth
                }
            };

        headers || (headers = { });

        body && (headers['Content-Length'] = body.length);

        Object.keys(headers).forEach(function(header) {
            options.headers[header] = headers[header];
        });

        var req = HTTPS.request(options, function(res) {
            var code = res.statusCode,
                response = '';

            if(hasOwn.call(errors, code)) {
                return promise.reject(createHTTPError({
                    code: code,
                    message: errors[code]
                }));
            }

            res.setEncoding(responseEncoding);

            res.on('data', function(chunk) {
                response += chunk;
            });

            res.on('end', function() {
                promise.fulfill(response, res);
            });
        });

        body && req.write(body, responseEncoding);

        req.on('error', function(err) {
            promise.reject(err);
        });

        req.end();

        return promise;

    },

    /**
     * Конструирует HTTP ошибку
     * @private
     * @param {Object} params - параметры ошибки
     * @returns {HTTPError}
     */
    _createHTTPError : function(params) {
        var HTTPError = function(message) {
            this.name = 'HTTPError';
            this.code = params.code;
            this.message = message || '';
        };

        HTTPError.prototype = Error.prototype;

        return new HTTPError(params.message);
    }

};
