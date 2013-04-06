var splice = Array.prototype.splice;

module.exports.extend = function() {
    var args = splice.call(arguments, 0),
        res = args.shift();

    args.forEach(function(arg) {
        Object.keys(arg).forEach(function(key) {
            res[key] = arg[key];
        });
    });

    return res;
};
