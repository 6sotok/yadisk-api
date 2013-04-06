var vow = require('vow'),
    parser = require('xml2json');

module.exports = {
    /**
     * Загружает файл на сервер
     * @private
     * @param {String} pathname - путь на сервере
     * @param {Buffer} buf - данные для загрузки
     */
    put : function(pathname, buf) {
        return this._request('put', pathname, {
            'Expect': '100-continue',
            'Content-Type': 'application/binary'
        }, buf);
    },

    /**
     * Удаление файла
     * @param {String} filename - путь к файлу
     * @returns {Vow.promise}
     */
    delete: function(filename) {
        var promise = vow.promise(),
            request = this._request('DELETE', filename);

        request.then(function(res) {
            promise.fulfill(res);
        }).fail(function(err) {
            promise.reject(err);
        });

        return promise;
    },

    /**
     * Перемещение файла
     * @param {String} from - путь к исходному файлу
     * @param {String} to - целевой путь
     * @returns {Vow.promise}
     */
    move: function(from, to) {
        var promise = vow.promise(),
            request = this._request('MOVE', from, { Destination: to});

        request.then(function(res) {
            promise.fulfill(res);
        }).fail(function(err) {
            promise.reject(err);
        });

        return promise;
    },

    /**
     * Создание директории
     * @param {String} dirname - название директории
     * @returns {Vow.promise}
     */
    mkcol: function(dirname) {
        var promise = vow.promise(),
            request = this._request('MKCOL', dirname);

        request.then(function(res) {
            promise.fulfill(res);
        }).fail(function(err) {
            promise.reject(err);
        });

        return promise;
    },

    /**
     * Чтение директории. 
     * @param {String} path — путь до директории. 
     * @returns {Vow.promise} массив из объектов с полями, соответствующими
     * http://api.yandex.ru/disk/doc/dg/reference/propfind_contains-request.xml
     */
    readDir: function (path) {
        var promise = vow.promise(),
            request = this._request('PROPFIND', path, { Depth: 1 });

        request
            .then(function (response) {
                var answer = JSON.parse(parser.toJson(response));
                promise.fulfill(answer['d:multistatus']['d:response']);
            })
            .fail(function (err) {
                promise.reject(err);
            });

        return promise;
    }
};
