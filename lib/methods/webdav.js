var inherit = require('inherit'),
    vow = require('vow');

module.exports = inherit({

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
    }
});

