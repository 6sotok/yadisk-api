#Yandex disk api for Node.js
##Installation
```
npm install
```
##Using
```js
var YaDiskAPI = require('yadisk-api'),
    mydisk = new YaDiskAPI({
        login: mylogin@yandex.ru,
        password: mypassword
    }); // or your token

var fs = require('vow-fs'); // for example.
mydisk.get('/myfile').then(function (params) {
    fs.write('docs/myfile', params.data, 'binary').always(function () {
        console.log('fs.write', arguments);
    });
});
```

##API methods
* get (pathname) : promise
* put (pathname, bug) : promise
* delete (filename) : promise
* move (from, to) : promise
* copy (originalPath, newPath) : promise
* mkcol (dirname) : promise. — Create dir
* readDir (path) : Array
* getProperty (path, [property]) : Array or string
* setProperty (path, property, value) : promise
* publish (filename) : String (URL)
* unpublish (filename): promise
