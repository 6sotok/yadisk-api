var publishParam = '?publish',
    unpublishParam = '?unpublish',
    vow = require('vow');

module.exports = {

    // TODO isPublished

    /**
     * Публикация файла
     * @param {String} filename - путь до файла
     * @returns {Vow.promise} url до файла
     */
    publish: function(filename) {
        var promise = new vow.promise();

        this._changeState(filename, true).then(function(data) {
            var url = data.res.headers.location;

            promise.fulfill(url);
        }).fail(function(err) {
            promise.reject(err);
        });

        return promise;
    },

    /**
     * Приватизация файла
     * @param {String} filename - путь до файла
     * @returns {Vow.promise}
     */
    unpublish: function(filename) {
        return this._changeState(filename, false);
    },

    /**
     * Приватизация файла
     * @private
     * @param {String} filename - путь до файла
     * @param {Boolean} publish - публиковать или нет
     * @returns {Vow.promise}
     */
    _changeState: function(filename, publish) {
        var promise = vow.promise(),
            path = filename + (publish ? publishParam : unpublishParam);

        return this._request(
            'POST',
            path
        );
    }

};
