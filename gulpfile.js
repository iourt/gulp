var gulp = require('gulp'),
	uglify = require('gulp-uglify'), // 引入JS压缩插件
	minifyCSS = require('gulp-minify-css'), // 引入CSS压缩
	handlebars = require('gulp-handlebars'), // 引入handlebars
	defineModule = require('gulp-define-module'),
	rename = require("gulp-rename"), // 修改文件名 
	zip = require('gulp-zip'); // 文件压缩包

// 初始化配置
var appueConfig = {
	projects: ['prj-test'], // 项目目录
	html: '/**/*html', // HTML目录
	scripts: '/**/*js', // js文件
	css: '/**/*css', // CSS文件
	hbs: '/**/*hbs' // hbs 模板
};

// 循环项目run task
appueConfig.projects.forEach(function(prj){

	var pathHTML = prj+appueConfig.html, // HTML目录
		pathJS   = prj+appueConfig.scripts, // JS目录
		pathCSS  = prj+appueConfig.css, // CSS目录
		pathHBS  = prj+appueConfig.hbs; // handlebars目录

	var pathPRJ = 'build/'+prj;

	// 移动html文件
	gulp.task('move-html', function(){
		gulp.src(pathHTML)
			.pipe(gulp.dest(pathPRJ));
	});

	// 压缩代码
	gulp.task('compress', function(){
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
			.pipe(gulp.dest(pathPRJ));
	});

	gulp.task('zip', function () {
	    gulp.src(pathPRJ+'/**/*')
	        .pipe(zip(prj+'.zip'))
	        .pipe(gulp.dest('zip'));
	});

	// 监视项目
	gulp.task('watch', function() {
		gulp.watch(pathHTML, ['move-html']);
		gulp.watch(pathJS, ['compress']);
		gulp.watch(pathCSS, ['minify-css']);
		gulp.watch(pathHBS, ['templates']);
	});
});

// 默认执行任务 $ gulp
gulp.task('default', ['move-html', 'compress', 'minify-css', 'templates', 'watch']);

gulp.task('zipfile', ['move-html', 'compress', 'minify-css', 'templates', 'zip']);
