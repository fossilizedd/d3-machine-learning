var gulp = require('gulp');
var del = require('del');
var config = require('./gulp.config')();

var $ = require('gulp-load-plugins')({lazy: true});
var browserSync = require('browser-sync');
var browserify = require('browserify');
var es = require('event-stream');
var series = require('stream-series');
var karma = require('karma').server;
var lazypipe = require('lazypipe');

var port = process.env.PORT || config.defaultPort;

gulp.task('help', $.taskListing);

gulp.task('default', ['help']);

gulp.task('templatecache', ['clean-code'], function() {
    log('Creating an AngularJS $templateCache');
    return gulp.src(config.htmlTemplates).on('error', errorHandler)
        .pipe($.plumber())
        .pipe($.htmlmin({ collapseWhitespace: true}))
        .pipe($.plumber())
        .pipe($.angularTemplatecache(config.templateCache.file, config.templateCache.options))
        .pipe($.plumber())
        .pipe(gulp.dest(config.temp))
        .pipe($.plumber())

});

gulp.task('optimize', ['inject'], function() {
    log('Starting reduction of js, css and html files into single files');

    var templateCache = config.temp + config.templateCache.file;
    var css = '*.css';
    var js = '*.js';

    var jsPipe = lazypipe()
        .pipe($.ngAnnotate)
        .pipe($.uglify);

    var cssPipe = lazypipe()
        .pipe($.htmlmin);

    return gulp.src(config.index)
        .pipe($.inject(gulp.src(templateCache, {read: false}), {
            starttag: '<!-- inject:templates.js -->'
        }))
        .pipe($.useref({searchPath: './'}))
        .pipe($.if(['*/*.js', '*/*.css', '!*/index.html'], $.rev()))
        .pipe($.if(['*/*.js', '!*/lib.js'], jsPipe()))
        .pipe($.if(['*/*.css', '!*/lib.css'], cssPipe()))
        .pipe($.revReplace())
        .pipe(gulp.dest(config.serve));
})

gulp.task('fonts', ['clean-fonts'], function() {
    log('Preparing serve fonts');
    return gulp.src(config.fonts)
        .pipe(gulp.dest(config.dist + 'fonts'));
});

gulp.task('images', ['clean-images'], function() {
    log('Preparing serve images');
    return gulp.src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.dist + 'images'));
});

gulp.task('wiredep', function() {
    log('Wiring bower dependencies into the index.html');
    var wiredep = require('wiredep').stream;
    return gulp.src(config.index)
        .pipe(wiredep(config.wiredepConfig()))
        .pipe($.inject(gulp.src(config.wireJS), {name: 'inject-js'}))
        .pipe(gulp.dest(config.d3machine));
});

gulp.task('inject', ['wiredep', 'sass', 'templatecache'], function() {
    log('Injecting css dependencies into index.html');
    return gulp.src(config.index)
        .pipe($.inject(gulp.src(config.css), {name:'inject-css'}))
        .pipe(gulp.dest(config.d3machine));
});

//Build css from sass
gulp.task('sass', ['clean-styles'], function() {
    log('Transpiling sass into css');
    return gulp.src(config.sass)
    .pipe($.plumber())
    .pipe($.sass())
    .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.temp))
});

gulp.task('lint', function() {
    log('Linting .js files');
    gulp.src(config.js)
    .pipe($.eslint({
        config: '.eslintrc'
    }))
    .pipe($.eslint.format());
});

gulp.task('clean', function(done) {
    var delDir = [].concat(config.dist, config.temp);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delDir, done);
});

gulp.task('clean-styles', function() {
    return clean(config.css);
});

gulp.task('clean-images', function() {
    return clean(config.dist + 'images/**/*.*');
});

gulp.task('clean-fonts', function() {
    return clean(config.dist + 'images/**/*.*');
});

gulp.task('clean-code', function() {
    log('Deleting build files');
    var files = [].concat(
        config.temp + '**/*.js',
        config.serve + '**/*.html',
        config.serve + 'js/**/*.js'
    )
    return clean(files);
});

function clean(path) {
    log('Cleaning: ' + $.util.colors.blue(path));
    return del(path);
}

gulp.task('sass-watch', function(){
    log('Starting sass watcher')
    gulp.watch([config.sass], ['sass']);
});

gulp.task('serve-build', ['optimize'], function() {
    serve(false);
});

gulp.task('serve-dev', ['inject'], function() {
    serve(true);
});

function serve(isDev) {
    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT' : port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.serverFiles]
    }

    return $.nodemon(nodeOptions)
        .on('restart', function() {
            log('*** nodemon restarted');
            setTimeout(function() {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay)
        })
        .on('start', function() {
            log('*** nodemon started');
            startBrowserSync(isDev);
        })
        .on('crash', function() {
            log('*** nodemon crash');
        })
        .on('exit', function() {
            log('*** nodemon exit');
        });
}

//Need to run tests
gulp.task('test', function() {
    karma.start({
        configFile: __dirname + config.karma,
        browsers: ['PhantomJS'],
        singleRun: true
    })
});

gulp.task('tdd', function() {
    karma.start({
        configFile: __dirname + config.karma,
        browsers: ['PhantomJS']
    });
})

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function startBrowserSync(isDev) {
    if (browserSync.active) {
        return;
    }

    log('Starting BrowserSync on port ' + port);

    if(isDev) {
        gulp.watch([config.sass], ['sass'])
        .on('change', function(event) { changeEvent(event);});
    } else {
        gulp.watch([config.sass, config.js, config.html], ['browserSyncReload'])
        .on('change', function(event) { changeEvent(event);});
    }

    var options = {
        proxy: 'localhost:' + port,
        port: port,
        files: isDev ? [
            config.d3machine + '**/*.*',
            '!' + config.sass,
            config.css
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'frontend-build',
        notify: true,
        reloadDelay: 1000
    };
    browserSync(options);
}

/**
 * When files change, log it
 * @param  {Object} event - event that fired
 */
function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

/**
 * Optimize the code and re-load browserSync
 */
gulp.task('browserSyncReload', ['optimize'], browserSync.reload);

// Handle the error
function errorHandler (error) {
  console.log(error.toString());
  this.emit('end');
}
