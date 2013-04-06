var Api = require('../index.js');

var api = new Api({
    login: 'testya-ya@yandex.ru',
    password: '123123'
});

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
fs.read(filename).then(function(buf) {
    api.put('/' + filename, buf).always(function() {
        console.log('put', arguments);
    });
});
