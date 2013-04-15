var vow = require('vow'),
    parser = require('xml2json'),
    ltx = require('ltx'),
    PATH = require('path');

module.exports = {

    /**
     * Скачивает файл с сервера.
     * @param {String} pathname - путь на сервере.
     * @returns {Vow.promise}
     */
    get: function(pathname) {
        return this._request('GET', pathname);
    },

    /**
     * Загружает файл на сервер.
     * @param {String} pathname - путь на сервере.
     * @param {Buffer} buf - данные для загрузки.
     */
    put : function(pathname, buf) {
        return this._request('put', pathname, {
            'Expect': '100-continue',
            'Content-Type': 'application/binary'
        }, buf);
    },

    /**
     * Удаление файла.
     * @param {String} filename - путь к файлу.
     * @returns {Vow.promise}
     */
    delete: function(filename) {
        return this._request('DELETE', filename);
    },

    /**
     * Перемещение
     * @param {String} from - путь к исходному файлу.
     * @param {String} to - целевой путь.
     * @returns {Vow.promise}
     */
    move: function(from, to) {
        to  = PATH.resolve('/', to);

        return this._request('MOVE', from, {Destination: to});
    },


    /**
     * Копирование файла.
     * @param {String} originalPath - путь к исходному файлу.
     * @param {String} newPath - целевой путь.
     * @returns {Vow.promise}
     */
    copy: function(originalPath, newPath) {
        newPath  = PATH.resolve('/', newPath);

        return this._request('COPY', originalPath, {Destination: newPath});
    },

    /**
     * Создание директории.
     * @param {String} dirname - название директории.
     * @returns {Vow.promise}
     */
    mkcol: function(dirname) {
        return request = this._request('MKCOL', dirname);
    },

    /**
     * Чтение директории.
     * @param {String} path — путь до директории.
     * @returns {Vow.promise} массив из объектов с полями, соответствующими
     * http://api.yandex.ru/disk/doc/dg/reference/propfind_contains-request.xml
     */
    readDir: function (path) {
        var promise = vow.promise(),
            request = this._request('PROPFIND', path, {Depth: 1 });

        request
            .then(function (response) {
                var answer = JSON.parse(parser.toJson(response.data));
                promise.fulfill(answer['d:multistatus']['d:response']);
            })
            .fail(function (err) {
                promise.reject(err);
            });

        return promise;
    },

    /**
     * Получение свойств файла или каталога на Яндекс.Диске. 
     * http://api.yandex.ru/disk/doc/dg/reference/propfind_property-request.xml#propfind_property-request
     * @params {String} path — путь к файлу или каталогу.
     * @params {String} [property] — имя свойства.
     * Если параметр не указан — вернутся все свойства для запрошенного файла или каталога. 
     * @returns {Vow.promise} значение свойства, массив свойств.
     */
    getProperty: function (path, property) {
        var promise = vow.promise(),
            xmlHeader = '<?xml version="1.0" encoding="utf-8" ?>',
            depth = 0,
            xmlBody,
            request;

        xmlBody = new ltx.Element('propfind', { 
            xmlns: 'DAV:'
        });

        if (property) {
            depth = 0;

            xmlBody
                .c('allprop').up()
                .c('include')
                .c(property);
        } else {
            xmlBody
                .c('allprop');
        }

        xmlBody = xmlHeader + xmlBody.root().toString();
        var header = {
            Depth: depth,
            "Content-Type": "application/x-www-form-urlencoded"
        };
        request = this._request('PROPFIND', path, header, xmlBody);

        request
            .then(function (response) {
                var answer = JSON.parse(parser.toJson(response.data));
                answer = answer['d:multistatus']['d:response']['d:propstat']['d:prop'];
                promise.fulfill(property ? answer['d:' + property] : answer);
            })
            .fail(function (err) {
                promise.reject(err);
            });

        return promise;
    },

    /** 
     * Изменение свойств файла или каталога на Яндекс.Диске. 
     * http://api.yandex.ru/disk/doc/dg/reference/proppatch.xml
     * @params {String} path - путь до файла или каталога.
     * @params {String} property - имя свойства.
     * @params {String} value — новое значение. 
     * @returns {Vow.promise} 
     */
    setProperty: function (path, property, value) {
        var promise = vow.promise(),
            header = {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            xmlHeader = '<?xml version="1.0" encoding="utf-8" ?>',
            xmlBody,
            request;

        xmlBody = new ltx.Element('propertyupdate', { 
            xmlns: "DAV:"
        });

        xmlBody
            .c('set')
            .c('prop')
            .c(property)
                .t(value);

        xmlBody = xmlHeader + xmlBody.root().toString();
        request = this._request('PROPPATCH', path, header, xmlBody);

        request
            .then(function (response) {
                promise.fulfill(response.data);
            })
            .fail(function (err) {
                promise.reject(err);
            });

        return promise;
    }
};
