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
	map 		 = require('map-stream'); 

// 初始化配置
var appConfig = {
	path: 'build/', // build 项目地址
	projects: ['prj-test'], // 项目目录
	allfiles: '/**/*', // 所有文件
	html: '/**/*html', // HTML目录
	scripts: '/**/*js', // js文件
	css: '/**/*css', // CSS文件
	hbs: '/**/*hbs' // hbs 模板
};

var taskProject = {};

// 循环项目run task
appConfig.projects.forEach(function(prj){

	var pathALL  = appConfig.path+appConfig.allfiles, // 所有文件
		pathHTML = prj+appConfig.html, // HTML目录
		pathJS   = prj+appConfig.scripts, // JS目录
		pathCSS  = prj+appConfig.css, // CSS目录
		pathHBS  = prj+appConfig.hbs; // handlebars目录

	// clean files
	gulp.task('clean', function(){
		return gulp.src(['build/', 'zip/'], {read: false})
					.pipe(clean());
	});

	taskProject = {
		// html移动
		html: function(){
			return gulp.src(pathHTML)
						.pipe(gulp.dest(appConfig.path+prj));
		},
		// js压缩
		compress: function(){
			return gulp.src(pathJS)
						.pipe(uglify({
							outSourceMap: false
						}))
						.pipe(gulp.dest(appConfig.path+prj));
		},
		concat: function(){

		},
		// css压缩
		minifycss: function(){
			return gulp.src(pathCSS)
						.pipe(minifyCSS())
						.pipe(gulp.dest(appConfig.path+prj));
		},
		// js文件合并
		// handlebars模板生成
		templates: function(){
			return gulp.src(pathHBS)
						.pipe(handlebars())
						.pipe(defineModule('amd'))
						.pipe(rename(function(path){
							// path.dirname += '';
							path.basename += ".hbs";
							path.extname = ".js"
						}))
						.pipe(gulp.dest(appConfig.path+prj));
		},
		// js效验
		check: function(){
			return gulp.src(pathJS)
					.pipe(jshint())
					.pipe(jshint.reporter(stylish))
					.pipe(jshint.reporter('fail'));
		},
		// zip压缩
		zip: function(){
			return gulp.src(pathALL)
    					.pipe(zip(prj+'.zip'))
    					.pipe(gulp.dest('zip'));
		},
		// web server
		connect: function(port){
			connect.server({
				root: '',
				port: port,
				livereload: true
			});
			gulp.src('')
				.pipe(shell([
					'open http://localhost:'+port
				]));
		},
		// 监视
		watch: function(){
			var self = this;
			if(!appConfig.path){
				gulp.watch(pathJS, function(){
					self.check();
				});
				gulp.watch(pathHBS, function(){
					self.templates();
				});
			}else{
				gulp.watch(pathALL, ['clean']);
				gulp.watch(pathHTML, function(){
					self.html();
				});
				gulp.watch(pathJS, function(){
					self.check();
					self.compress();
				});
				gulp.watch(pathCSS, function(){
					self.minifycss();
				});
				gulp.watch(pathHBS, function(){
					self.templates();
				});
			}
		}
	};

	// JS 文件效验
	// var myReporter = map(function (file, callback) {
	// 	if (!file.jshint.success) {
	// 		console.log('JSHINT fail in '+file.path);
	// 		file.jshint.results.forEach(function (err) {
	// 			if (err) {
	// 				console.log(' '+file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason);
	// 			}
	// 		});
	// 	}
	// 	callback(null, file);
	// });
	// gulp.task('lint', function() {
	// 	gulp.src(pathJS)
	// 		.pipe(jshint())
	// 		.pipe(myReporter);
	// });
	gulp.task('zip', function(){
		return gulp.src(pathALL)
    				.pipe(zip(prj+'.zip'))
    				.pipe(gulp.dest('zip'));
	});
});

// 建立生产 $ gulp build
// gulp.task('build', ['lint', 'move-html', 'compress', 'minify-css', 'templates', 'watch']);
gulp.task('build', ['clean'], function(){
	taskProject.check();
	taskProject.html();
	taskProject.compress();
	taskProject.minifycss();
	taskProject.templates();
	taskProject.connect(2222);
	taskProject.watch();
});

// 开发环境
gulp.task('run', ['clean'], function(){
	appConfig.path = '';
	taskProject.check();
	taskProject.templates();
	taskProject.connect(1111);
	// taskProject.watch();
});
