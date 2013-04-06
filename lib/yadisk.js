var PATH = require('path'),
    HTTPS = require('https'),
    inherit = require('inherit'),
    Vow = require('vow'),
    parser = require('xml2json');

exports = inherit({

    __constructor : function(params) {

        this._auth = params.OAuthToken?
            'OAuth ' + login :
            'Basic ' + new Buffer(login + ':' + password, 'utf8').toString('base64');

    },

    _host : 'webdav.yandex.ru',
    _port : 443,

    /**
     * Отправляет запрос на сервер
     * @private
     * @param {String} method - метод запроса
     * @param {String} path - путь
     * @param {Object} headers
     * @param {Buffer|String} [body] - тело запроса
     * @param {String} [responseEncoding=binary] - кодировка запроса
     * @returns {Vow.promise}
     */
    _request : function(method, pathname, headers, body, responseEncoding) {

        responseEncoding || (responseEncoding = 'binary');

        var promise = Vow.promise(),
            options = {
                host: this._host,
                port: this._port,
                method: method.toUpperCase(),
                path: encodeURI(PATH.resolve(pathname)),
                headers: {
                    'Host': this._host,
                    'Accept': '*/*',
                    'Authorization': this._auth
                }
            };

        Object.keys(headers || { }).forEach(function(header) {
            options.headers[header] = headers[header];
        });

        var req = HTTPS.request(options, function(res) {
            var code = res.statusCode,
                response = [ ];

            if (code == 401) {
                return promise.reject(new Error('Auth error'));
            } else if (code == 404) {
                return promise.reject(new Error('Not found'));
            } else if (code == 409) {
                return promise.reject(new Error('Conflict'));
            }

            res.setEncoding(responseEncoding);

            res.on('data', function(chunk) {
                response.push(chunk);
            });

            res.on('end', function() {
                promise.fulfill(Buffer.concat(response));
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
     * Листинг директории.
     * @param {String} path - путь к директоррии.
     * @param {Function} callback - колбэк.
     */
    ls: function (path, callback) {
        this._request('PROPFIND', path, { Depth: 1 }, null, 'utf8', function (err, response) {
            if (err) {
                return callback(err);
            }
            try {
                var jsonAnswer = parser.toJson(response);
                console.log(jsonAnswer);
            }
        }
    },
});
