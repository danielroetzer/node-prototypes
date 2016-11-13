var express = require('express');

var app = express();

var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/js', express.static(__dirname + '/js'));

app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

function checkAuth(req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next(); }
}

app.get('/', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    var user = req.body.username,
        pw = req.body.password;

    if (user === 'u1' && pw === 'test') {
        req.session.user = 'u1';
    } else if (user === 'u2' && pw === 'test') {
        req.session.user = 'u2';
    }

    res.redirect('/chat');
});

app.get('/chat', checkAuth, function (req, res) {
    res.render('chat', {user: req.session.user});
});

app.get('/logout', function (req, res) {
    delete req.session.user;
    res.redirect('/');
});


app.listen(8080);

var WSS = require('websocket').server,
    http = require('http');

var server = http.createServer();
server.listen(8181);

var wss = new WSS({
    httpServer: server,
    autoAcceptConnections: false
});

var connections = [];

wss.on('request', function (request) {
    var connection = request.accept('chat', request.origin);

    connections.push(connection);

    connection.on('message', function(message) {
        for (var i = 0; i < connections.length; i++) {
            if (connections[i] && connections[i].send) {
                connections[i].send(message.utf8Data);
            } }
    }); });
