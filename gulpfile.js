var gulp 		 = require('gulp'),
	uglify       = require('gulp-uglify'), // 引入JS压缩插件
	minifyCSS    = require('gulp-minify-css'), // 引入CSS压缩
	handlebars   = require('gulp-handlebars'), // 引入handlebars
	defineModule = require('gulp-define-module'),
	rename 		 = require("gulp-rename"), // 修改文件名 
	zip 		 = require('gulp-zip'), // 文件压缩包
	jshint 		 = require('gulp-jshint'), // JS文件效验
	stylish 	 = require('jshint-stylish'), // JS效验报错
	clean 		 = require('gulp-clean'), // 文件清理
	connect 	 = require('gulp-connect'), // web server
	shell 		 = require('gulp-shell'), // shell
	concat 		 = require('gulp-concat'), // js文件合并
	map 		 = require('map-stream'),
	rjs 		 = require('gulp-requirejs'),
	bower 		 = require('gulp-bower'); 

// 初始化配置
var projectConfig = {
		path: 'build/', // build项目地址
		projects: ['prj-test', 'prj-a'] // 项目目录
	};

var projectTask = function(params){
		this.prj = params.prj;
		this.filesAll = projectConfig.path + '/**/*'; // 所有文件
		this.filesHtml = [
			this.prj + '/**/*.html',
			this.prj + '/**/*.php',
			this.prj + '/**/*.json'
		]; // html文件
		this.filesJs = this.prj + '/**/*.js'; // js文件
		this.filesCheckJs = [
			this.filesJs,
			'!'+this.prj+'/**/*.hbs.js',
			'!node_modules/',
			'!.git',
			'!'+this.prj+'/js/lib/*.js'
		]; // js检查
		this.filesCss = this.prj + '/**/*.css'; // css文件
		this.filesHbs = this.prj + '/**/*.hbs'; // handlebars文件
	};

projectTask.prototype = {
	// bower library
	// https://github.com/iourt/library.git#master
	getLibrary: function(){
		return bower()
				.pipe(gulp.dest(this.prj + '/js'));
	},
	// html移动
	moveHtml: function(){
		return gulp.src(this.filesHtml)
					.pipe(gulp.dest(projectConfig.path + this.prj));
	},
	// js压缩
	compress: function(){
		return gulp.src(this.filesJs)
					.pipe(uglify({
						outSourceMap: false
					}))
					.pipe(gulp.dest(projectConfig.path + this.prj));
	},
	concat: function(){
		return gulp.src('./lib/*.js')
					.pipe(concat('all.js'))
					.pipe(gulp.dest(projectConfig.path + this.prj));
	},
	// css压缩
	minifycss: function(){
		return gulp.src(this.filesCss)
					.pipe(minifyCSS())
					.pipe(gulp.dest(projectConfig.path + this.prj));
	},
	// js文件合并
	// handlebars模板生成
	templates: function(){
		return gulp.src(this.filesHbs)
					.pipe(handlebars())
					.pipe(defineModule('amd'))
					.pipe(rename(function(path){
						// path.dirname += '';
						path.basename += ".hbs";
						path.extname = ".js"
					}))
					.pipe(gulp.dest(projectConfig.path + this.prj));
	},
	// js效验
	check: function(){
		return gulp.src(this.filesCheckJs)
				.pipe(jshint())
				.pipe(jshint.reporter(stylish))
				.pipe(jshint.reporter('fail'));
	},
	// zip压缩
	zip: function(){
		return gulp.src(this.filesAll)
					.pipe(zip(prj+'.zip'))
					.pipe(gulp.dest('zip'));
	},
	// 监视
	watch: function(){
		var self = this;
		if(!projectConfig.path){
			gulp.watch(self.filesJs, function(){
				self.check();
			});
			gulp.watch(self.filesHbs, function(){
				self.templates();
			});
		}else{
			// gulp.watch(self.filesAll, ['clean']);
			gulp.watch([this.prj + '/**/*.php', this.prj + '/**/*.json'], function(){
				self.tmp();
			});
			gulp.watch(self.filesHtml, function(){
				self.moveHtml();
			});
			gulp.watch(self.filesJS, function(){
				self.check();
				self.compress();
			});
			gulp.watch(self.filesCss, function(){
				self.minifycss();
			});
			gulp.watch(self.filesHbs, function(){
				self.templates();
			});
		}
	}
};


// web server
var serverStart = function(port){
	connect.server({
		root: '',
		port: port,
		livereload: true
	});
	// gulp.src('')
	// 	.pipe(shell([
	// 		'open http://localhost:'+port
	// 	]));
};

gulp.task('requirejsBuild', function() {
    rjs({
    	findNestedDependencies: true,
        skipPragmas: true,
        baseUrl: 'prj-test/js',
        out: 'prj-test/js/app/main.min.js',
		paths: {
			'jquery':     'lib/jquery',
			'underscore': 'lib/underscore',
			'backbone':   'lib/backbone',
			'handlebars': 'lib/handlebars',
			'router':     'app/router',
			'require':    'lib/require'
		},
		shim: {
			backbone: {
				'deps': ['jquery', 'underscore'],
				'exports': 'Backbone'
			},
			underscore: {
				'exports': '_'
			},
			handlebars: {
				exports: 'Handlebars',
				init: function() {
					this.Handlebars = Handlebars;
					return this.Handlebars;
				}
			}
		},
		name: 'config',
        include: ['app/main.js'],
        create: true
    })
    .pipe(gulp.dest('./delpoy/')); 
});


gulp.task('bower', function() {
	projectConfig.path = '';
	projectConfig.projects.forEach(function(prj){
		var prjTask = new projectTask({
			prj: prj
		});
		prjTask.getLibrary();
	});
});

gulp.task('clean', function(){
	gulp.src(['build/', 'zip/'], {read: false})
		.pipe(clean());
});

// 发布生产测试 $ gulp test
// gulp.task('build', ['lint', 'move-html', 'compress', 'minify-css', 'templates', 'watch']);
gulp.task('test', ['clean'], function(){
	projectConfig.projects.forEach(function(prj){
		var prjTask = new projectTask({
			prj: prj
		});
		prjTask.check();
		prjTask.moveHtml();
		prjTask.compress();
		prjTask.minifycss();
		prjTask.templates();
		// prjTask.watch();
	});
	serverStart(2222);
});

// 开发环境 $ gulp run
gulp.task('run', ['clean'], function(){
	projectConfig.path = '';
	projectConfig.projects.forEach(function(prj){
		var prjTask = new projectTask({
			prj: prj
		});
		prjTask.check();
		prjTask.templates();
		prjTask.watch();
	});
	serverStart(1111);
});