var Api = require('../index.js');

var api = new Api(require('./credentials'));

api._request('POST', '/test?publish').then(function() {
    console.log('promise', arguments);
}).fail(function() {
    console.log('fail', arguments);
});

api
    .delete('test.pdf')
    .then(function(res) {
        console.log('deleted');
        console.log(res);
    })
    .fail(function(err) {
        console.log('failed');
        console.log(err);
    });

var fs = require('vow-fs');

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
