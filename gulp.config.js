module.exports = function() {
    var styles = './src/client/resources/';
    var d3machine = './src/client/';
    var server = './src/server/';
    var serve = './.serve/';
    var temp = './.temp/';

    var config = {
        d3machine: d3machine,
        serve: serve,
        temp: temp,
        dist: './dist/',
        js: ['./src/**/*.js'],
        index: d3machine + 'index.html',
        sass: [styles + '**/*.scss'],
        sassTemp: ['.serve/'],
        css: temp + '**/*.css',
        htmlTemplates: + d3machine + '**/*.html',
        wiredepConfig: wiredepConfig,
        wireJS: [
            d3machine + '**/*.module.js',
            d3machine + '**/*.js',
            '!' + d3machine + '**/*.spec.js'
        ],
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },
        fonts: './bower_components/fonts-awesome/fonts/**/*.*',
        images: 'images',
        defaultPort: 8080,
        nodeServer: './src/server/app.js',
        server: server,
        browserReloadDelay: 2000,
        templateCache: {
            options:  {
                module: 'd3machinelearn.core',
                standAlone: false,
                root: 'd3machine/'
            },
            file: 'templates.js'
        }
    };

    function wiredepConfig() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        }
        return options;
    }

    return config;
}
