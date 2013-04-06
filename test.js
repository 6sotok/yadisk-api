var Api = require('./index.js');

var api = new Api({
    login: 'testya-ya@yandex.ru',
    password: '123123'
});

api._request('POST', '/test?publish').then(function() {
    console.log('promise', arguments);
}).fail(function() {
    console.log('fail', arguments);
});
