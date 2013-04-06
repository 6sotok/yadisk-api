var publishParam = '?publish',
    unpublishParam = '?unpublish',
    inherit = require('inherit'),
    vow = require('vow');

module.exports = inherit({

    // TODO isPublished

    /**
     * Публикация файла
     * @param {String} filename - путь до файла
     * @returns {Vow.promise}
     */
    publish: function(filename) {
        return this._changeState(filename, true);
    },

    /**
     * Приватизация файла
     * @param {String} filename - путь до файла
     * @returns {Vow.promise}
     */
    unpublish: function(filename) {
        return this._changeState(filename, false);
    },

    _changeState: function(filename, publish) {
        var promise = vow.promise(),
            path = filename + (publish ? publishParam : unpublishParam),
            request = this._request(
                'POST',
                path
            );

        request.then(function(res) {
            promise.fulfill(res);
        }).fail(function(err) {
            promise.reject(err);
        });

        return promise;
    }

});

