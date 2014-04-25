'use strict';

module.exports = {
	reporter: function (result, config, options) {
		var total = result.length;
		var ret = '';
		var headers = [];
		var prevfile;

		options = options || {};

		ret += table(result.map(function (el, i) {
			var err = el.error;
			var line = [
				'',
				chalk.gray('line ' + err.line),
				chalk.gray('col ' + err.character),
				chalk.cyan(err.reason)
			];

			if (el.file !== prevfile) {
				headers[i] = chalk.white(el.file);
			}

			if (options.verbose) {
				line.push(chalk.gray('(' + err.code + ')'));
			}

			prevfile = el.file;

			return line;
		}), {
			stringLength: function (str) {
				return chalk.stripColor(str).length;
			}
		}).split('\n').map(function (el, i) {
			return headers[i] ? '\n' + chalk.underline(headers[i]) + '\n' + el : el;
		}).join('\n') + '\n\n';

		if (total > 0) {
			ret += chalk.red.bold((process.platform !== 'win32' ? '✖ ' : '') + total + ' problem' + (total === 1 ? '' : 's'));
		} else {
			ret += chalk.green.bold((process.platform !== 'win32' ? '✔ ' : '') + 'No problems');
			ret = '\n' + ret.trim();
		}

		console.log(ret + '\n');
	}
};