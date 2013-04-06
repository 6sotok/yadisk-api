var winston = require('winston'),
    yadisk = require('../yadisk');
    logger = new (winston.Logger)({
    transports: [
          new (winston.transports.Console)(),
          new (winston.transports.File)({ filename: 'yadisk.log' })
        ]
    });

module.exports = function() {
    return this
        .title('test').helpful()
        .act(function(opts, args) {
            var disk = new yadisk({
                login: 'testya-ya@yandex.ru ',
                password: '123123'
            });
            logger.info('OLOLO');
        });
}

