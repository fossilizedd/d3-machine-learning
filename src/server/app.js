'use strict';

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var environment = process.env.NODE_ENV;

console.log('Node crank crank crank');
console.log('PORT: ' + port);
console.log('Environment: ' + environment);

app.get('/ping', function(req, res, next) {
        console.log(req.body);
        res.send('pong');
});

switch(environment) {
    case 'build':
        console.log('BUILD');
        app.use(express.static('./.serve'));
        app.use('/app/*', function(req, res, next) {
            four0four.send404(req, res);
        });

        app.use('/*', express.static('./.serve/index.html'));
        break;
    default:
        console.log('DEV');
        app.use(express.static('./src/client'));
        app.use(express.static('./'));
        app.use(express.static('./.temp'));

        app.use('/app/*', function(req, res, next) {
            four0four.send404(req, res);
        });

        app.use('/*', express.static('./src/client/index.html'));
        break;
}

app.get('/', function(req, res) {
    res.send('Hello World');
});

app.listen(port, function() {
    console.log('d3-machine-learning');
    console.log('env = ' + app.get('env')
        + '\n__dirname = ' + __dirname
        + '\n process.cwd = ' + process.cwd());
});
