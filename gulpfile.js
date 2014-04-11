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
	map 		 = require('map-stream'); 

// 初始化配置
var appueConfig = {
	projects: ['prj-test'], // 项目目录
	allfiles: '/**/*', // 所有文件
	html: '/**/*html', // HTML目录
	scripts: '/**/*js', // js文件
	css: '/**/*css', // CSS文件
	hbs: '/**/*hbs' // hbs 模板
};

// 循环项目run task
appueConfig.projects.forEach(function(prj){

	var pathPRJ = 'build/'+prj;

	var pathALL  = pathPRJ+appueConfig.allfiles, // 所有文件
		pathHTML = prj+appueConfig.html, // HTML目录
		pathJS   = prj+appueConfig.scripts, // JS目录
		pathCSS  = prj+appueConfig.css, // CSS目录
		pathHBS  = prj+appueConfig.hbs; // handlebars目录


	// clean files
	gulp.task('cleanfile', function(){
		console.log(1);
		gulp.src(['build/', 'zip/'], {read: false})
			.pipe(clean());
	});

	// 移动html文件
	gulp.task('move-html', function(){
		console.log(2);
		gulp.src(pathHTML)
			.pipe(gulp.dest(pathPRJ));
	});

	// 压缩代码
	gulp.task('compress', function(){
		console.log(3);
		gulp.src(pathJS)
			.pipe(uglify({
				outSourceMap: false
			}))
			.pipe(gulp.dest(pathPRJ));
	});

	// 压缩CSS文件
	gulp.task('minify-css', function(){
		gulp.src(pathCSS)
			.pipe(minifyCSS())
			.pipe(gulp.dest(pathPRJ));
	});

	// handlebars 模板
	gulp.task('templates', function(){
		gulp.src(pathHBS)
			.pipe(handlebars())
			.pipe(defineModule('amd'))
			.pipe(rename(function(path){
				// path.dirname += '';
				path.basename += ".hbs";
				path.extname = ".js"
			}))
			.pipe(gulp.dest(prj))
			.pipe(gulp.dest(pathPRJ));
		//gulp.src(pathHBS)
		//	.pipe(handlebars())
		//	.pipe(defineModule('amd'))
		//	.pipe(rename(function(path){
		//		// path.dirname += '';
		//		path.basename += ".hbs";
		//		path.extname = ".js"
		//	}))
		//	.pipe(gulp.dest(prj));
	});

	// JS 文件效验
	gulp.task('lint', function() {
		gulp.src(pathJS)
			.pipe(jshint())
			.pipe(jshint.reporter(stylish))
			.pipe(jshint.reporter('fail'));
	});
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


	// 打包文件
	gulp.task('zipfile', function () {
	    gulp.src(pathALL)
	        .pipe(zip(prj+'.zip'))
	        .pipe(gulp.dest('zip'));
	});

	// 监视项目
	gulp.task('watch', function() {
		gulp.watch(pathALL, ['cleanfile']);
		gulp.watch(pathHTML, ['move-html']);
		gulp.watch(pathJS, ['compress']);
		gulp.watch(pathCSS, ['minify-css']);
		gulp.watch(pathHBS, ['templates']);
	});
});

gulp.task('connect', function () {
	connect.server({
		root: '',
		port: 8000,
		livereload: true
	});
	gulp.src('')
		.pipe(shell([
			'open http://localhost:8000'
		]));
});

// 建立生产 $ gulp build
// gulp.task('build', ['lint', 'move-html', 'compress', 'minify-css', 'templates', 'watch']);
gulp.task('build', ['cleanfile', 'lint', 'move-html', 'compress', 'minify-css', 'templates']);
// JS check
gulp.task('check', ['lint']);
// clean files
gulp.task('clean', ['cleanfile']);
// 打包文件 $ gulp zip
gulp.task('zip', ['zipfile']);
// run 服务器
gulp.task('run', ['build', 'connect', 'watch']);
