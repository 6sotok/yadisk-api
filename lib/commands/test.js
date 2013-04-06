
module.exports = function() {

    return this
        .title('test').helpful()
        .act(function(opts, args) {
            console.log('OLOLO');
        })
}

