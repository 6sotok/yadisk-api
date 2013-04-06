var inherit = require('inherit'),
    vow = require('vow');

module.exports = inherit({
    delete: function(filename) {
        var promise = vow.promise(),
            request = this._request('DELETE', '/' + filename);

        request.then(function(res) {
            promise.fulfill(res);
        }).fail(function(err) {
            promise.reject(err);
        });

        return promise;
    }
});

