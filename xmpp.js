var xmpp = require('node-xmpp'),
    argv = process.argv;

if (argv.length < 4 ) {
    console.error('Usage: node send_message.js <my-jid> <my-password> [<host>] [<port>]');
    process.exit(1);
}

var HOST = argv[4] || 'push.xmpp.yandex.ru',
    PORT = argv[5] || 5222;

var ltx = require('node-xmpp/node_modules/ltx');
var sasl = require('node-xmpp/lib/xmpp/sasl');
var Connection = xmpp.Connection;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var NS_CLIENT = 'jabber:client';
var PING = 'ping';
var NS_REGISTER = 'jabber:iq:register';
var NS_XMPP_SASL = 'urn:ietf:params:xml:ns:xmpp-sasl';
var NS_XMPP_BIND = 'urn:ietf:params:xml:ns:xmpp-bind';
var NS_XMPP_SESSION = 'urn:ietf:params:xml:ns:xmpp-session';

var STATE_PREAUTH = 0,
    STATE_AUTH = 1,
    STATE_AUTHED = 2,
    STATE_BIND = 3,
    STATE_SESSION = 4,
    STATE_ONLINE = 5;
var IQID_SESSION = 'sess',
    IQID_BIND = 'bind';

function decode64(encoded) {
    return (new Buffer(encoded, 'base64')).toString('utf8');
}
function encode64(decoded) {
    return (new Buffer(decoded, 'utf8')).toString('base64');
}


// Mechanisms
function XYandexOAuth() {
}
util.inherits(XYandexOAuth, EventEmitter);
XYandexOAuth.prototype.name = "X-YANDEX-OAUTH";
XYandexOAuth.prototype.auth = function() {
    return this.authzid.split('@')[0] + "\0" + this.access_token;
};


xmpp.Client.prototype.useFeatures = function() {
    if (this.state == STATE_PREAUTH &&
        this.register) {
    delete this.register;
    this.doRegister();
    } else if (this.state == STATE_PREAUTH &&
        this.streamFeatures.getChild('mechanisms', NS_XMPP_SASL)) {

        this.state = STATE_AUTH;
        var offeredMechs = this.streamFeatures.
            getChild('mechanisms', NS_XMPP_SASL).
            getChildren('mechanism', NS_XMPP_SASL).
            map(function(el) { return el.getText(); });
        this.mech = sasl.selectMechanism(
            offeredMechs,
            this.preferredSaslMechanism,
            this.availableSaslMechanisms);
        this.mech = this.mech ? this.mech: new XYandexOAuth();
        if (this.mech) {
            this.mech.authzid = this.jid.bare().toString();
            this.mech.authcid = this.jid.user;
            this.mech.password = this.password;
            this.mech.api_key = this.api_key;
            this.mech.access_token = this.access_token;
            this.mech.realm = this.jid.domain;  // anything?
            this.mech.digest_uri = "xmpp/" + this.jid.domain;
            var authMsg = encode64(this.mech.auth());

            var attrs = {};
            attrs.xmlns = NS_XMPP_SASL;
            attrs.mechanism = this.mech.name;
            this.send(new ltx.Element('auth', attrs).
              t(authMsg));
        } else {
            this.emit('error', 'No usable SASL mechanism');
        }
    } else if (this.state == STATE_AUTHED &&
               !this.did_bind &&
               this.streamFeatures.getChild('bind', NS_XMPP_BIND)) {
        this.state = STATE_BIND;
        var bindEl = new ltx.Element('iq',
                                     { type: 'set',
                                       id: IQID_BIND
                                     }).c('bind',
                                          { xmlns: NS_XMPP_BIND
                                          });
        if (this.jid.resource)
            bindEl.c('resource').t(this.jid.resource);
        this.send(bindEl);
    } else if (this.state == STATE_AUTHED &&
               !this.did_session &&
               this.streamFeatures.getChild('session', NS_XMPP_SESSION)) {
        this.state = STATE_SESSION;
        this.send(new ltx.Element('iq',
                                  { type: 'set',
                                    to: this.jid.domain,
                                    id: IQID_SESSION
                                  }).c('session',
                                       { xmlns: NS_XMPP_SESSION
                                       }));
    } else if (this.state == STATE_AUTHED) {
        /* Ok, we're authenticated and all features have been
           processed */
        this.state = STATE_ONLINE;
        this.emit('online');
    }
};


var cl = new xmpp.Client({
    jid: argv[2],
    password: argv[3],
    host: HOST,
    port: PORT,
    access_token: '3a22b03daed948cbb3edf517b7c0d90a',
});

cl.addListener('online', function(){
    console.log('olol');
    //argv.slice(5).forEach(
    //    function(to) {
    //        cl.send(new xmpp.Element('message',
    //                                 { to: to,
    //                                   type: 'chat'}).
    //                c('body').
    //                t(argv[4]));
    //    });

    //// nodejs has nothing left to do and will exit
    //cl.end();
    console.log(cl.jid);
    cl.send( new xmpp.Element('iq', { to: cl.jid.user + "@" + cl.jid.domain, type: 'set', id: '13' })
                              .c('s', { xmlns: 'yandex:push:disk' })
    );
});

cl.on('stanza',
      function(stanza) {
        if (stanza.attrs.type !== 'error') {
            if (stanza.is('iq') && stanza.attrs.id.indexOf(PING) == 0) {
                var ping = new xmpp.Element('iq',
                    { type: 'result', to: stanza.attrs.from, id: stanza.attrs.id}
                );
                cl.send(ping);
            }
            console.log(stanza.toString());
        }
});

cl.addListener('error',
    function(e) {
        console.error(e);
        process.exit(1);
});

