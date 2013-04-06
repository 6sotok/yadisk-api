var Api = require('../index.js'),
    fs = require('vow-fs'),
    api = new Api(require('./credentials'));

api._request('POST', '/test?publish').then(function() {
    console.log('promise', arguments);
}).fail(function() {
    console.log('fail', arguments);
});

api.delete('test.pdf').always(function() {
    console.log('delete', arguments);
});

var filename = 'pepyaka.jpg';
fs.read('test/' + filename).then(function(buf) {
    return api.put('/' + filename, buf);
}).then(function() {
    console.log('put', arguments);

    api.get('/pepyaka.jpg').then(function(buf) {
        fs.write('test/pepyaka2.jpg', buf, 'binary').always(function() {
            console.log('fs.write', arguments);
        });
    });
});
