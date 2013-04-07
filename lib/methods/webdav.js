var vow = require('vow'),
    parser = require('xml2json'),
    ltx = require('ltx');

module.exports = {

    /**
     * Скачивает файл с сервера
     * @protected
     * @param {String} pathname - путь на сервере
     * @returns {Vow.promise}
     */
    get: function(pathname) {
        return this._request('GET', pathname);
    },

    /**
     * Загружает файл на сервер
     * @protected
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
     * @protected
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
     * @protected
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
     * @protected
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
     * Чтение директории
     * @protected
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
    },

    /**
     * Получение свойств файла или каталога на Яндекс.Диске. 
     * @params {String} path — путь к файлу или каталогу
     * @params {String} [property] — имя своства, которое запрашивается, в соответствии с 
     * http://api.yandex.ru/disk/doc/dg/reference/propfind_property-request.xml#propfind_property-request
     * Если параметр не указан — вернуться все свойства для запрошенного файла или каталога. 
     * @returns {Vow.promise} значение свойства.  
     */
    getProperty: function (path, property) {
        var promise = vow.promise(),
            xmlHeader = '<?xml version="1.0" encoding="utf-8" ?>',
            depth = 1,
            xmlBody, 
            request;

        if (property) {
            xml = new ltx.Element('propfind', { 
                xmlns: 'DAV:'
            });

            xml
                .c('prop')
                .c(property);

            xmlBody = xmlHeader.root().toString() + xmlBody;
        } else {
            depth = 0;
        }

        var header = { 
            Depth: depth,
            "Content-Type": "application/x-www-form-urlencoded"
        };
        request = this._request('PROPFIND', path, header, xmlBody);

        request
            .then(function (response) {
                var answer = JSON.parse(parser.toJson(response));
                answer = answer['d:multistatus']['d:response']['d:propstat']['d:prop'];
                promise.reject(answer);
            })
            .fail(function (err) {
                promise.reject(err);
            })

        return promise;
    }
};
