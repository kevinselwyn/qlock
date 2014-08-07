/*globals clearTimeout, console, document, global, require, setTimeout, window, XMLHttpRequest*/

var fs = typeof require === 'function' ? require('fs') : {
		readFile: function (url, callback) {
			'use strict';

			var xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						callback(null, xhr.response);
					} else {
						callback(true);
					}
				}
			};

			xhr.open('get', url, true);
			xhr.send(null);
		}
	},
	gui = typeof global === 'object' ? global.window.nwDispatcher.requireNwGui() : {};

(function (document, window) {
	'use strict';

	var qlock = {
		vars: {
			main: {},
			ticks: [],
			text: {},
			minute: {},
			hour: {},
			colors: []
		},
		mainMenu: {},
		tm: 0,
		templates: {
			selector: '{{selector}}{\n{{rules}}\n}',
			rule: '\t{{property}}:{{value}};'
		},
		extend: function (obj) {
			var i;

			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
					this[i] = obj[i];
				}
			}
		},
		trim: function (str) {
			return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		},
		addClass: function (el, name) {
			var text = typeof el === 'string',
				className = !text ? el.className : el;

			className = this.trim([className, name].join(' '));

			if (!text) {
				el.className = className;
			} else {
				return className;
			}
		},
		removeClass: function (el, name) {
			var text = typeof el === 'string',
				className = !text ? el.className : el;

			className = this.trim(className.replace(name, ''));

			if (!text) {
				el.className = className;
			} else {
				return className;
			}
		},
		render: function (template, context) {
			var regex = {},
				i;

			for (i in context) {
				if (context.hasOwnProperty(i)) {
					regex = new RegExp(['{{', i, '}}'].join(''));
					template = template.replace(regex, context[i]);
				}
			}

			return template;
		},
		capitalize: function (str) {
			return [str.charAt(0).toUpperCase(), str.slice(1)].join('');
		},
		time: function () {
			var date = new Date();

			return {
				hours: date.getHours() % 12,
				minutes: date.getMinutes()
			};
		},
		arraySearch: function (needle, haystack) {
			var i = 0,
				l = 0;

			for (i = 0, l = haystack.length; i < l; i += 1) {
				if (haystack[i] === needle) {
					return i;
				}
			}

			return 0;
		},
		setup: function () {
			var main = document.getElementById('qlock'),
				ticks = [],
				text = {},
				minute = {},
				hour = {},
				span = {},
				className = '',
				key = '',
				i = 0,
				l = 0;

			if (!main) {
				return false;
			}

			this.generate(main);

			span = main.getElementsByTagName('span');

			for (i = 0, l = span.length; i < l; i += 1) {
				className = span[i].className;
				key = '';

				if (className.search('tick') !== -1) {
					ticks.push(span[i]);
				}

				if (className.search('text') !== -1) {
					key = this.removeClass(className, 'text', true);

					text[key] = span[i];
				}

				if (className.search('minute') !== -1) {
					key = this.removeClass(className, 'minute', true);

					minute[key] = span[i];
				}

				if (className.search('hour') !== -1) {
					key = this.removeClass(className, 'hour', true);

					hour[key] = span[i];
				}
			}

			this.vars = {
				main: main,
				ticks: ticks,
				text: text,
				minute: minute,
				hour: hour
			};

			this.restoreAlarms();
			this.restoreSize();

			return true;
		},
		setTime: function () {
			var time = this.time(),
				hours = time.hours,
				minutes = time.minutes,
				tick = 0,
				text = [],
				textArr = [],
				minute = [
					'five',
					'ten',
					['a', 'quarter'],
					'twenty',
					['twenty', 'five'],
					'half'
				],
				hour = [
					'one',
					'two',
					'three',
					'four',
					'five',
					'six',
					'seven',
					'eight',
					'nine',
					'ten',
					'eleven',
					'twelve'
				],
				theMinute = 0,
				thisMinute = '',
				i = 0,
				l = 0;

			tick = minutes - (Math.floor(minutes / 5) * 5);
			this.setTicks(tick);

			theMinute = Math.floor(minutes / 5);

			text.push('it', 'is');
			textArr.push(this.vars.text.it, this.vars.text.is);

			if (theMinute > 0) {
				if (theMinute <= 6) {
					thisMinute = minute[theMinute - 1];

					if (typeof thisMinute === 'object') {
						for (i = 0, l = thisMinute.length; i < l; i += 1) {
							text.push(thisMinute[i]);
							textArr.push(this.vars.minute[thisMinute[i]]);
						}
					} else {
						text.push(thisMinute);
						textArr.push(this.vars.minute[thisMinute]);
					}

					text.push('past');
					textArr.push(this.vars.minute.past);
				} else {
					thisMinute = minute[11 - theMinute];

					if (typeof thisMinute === 'object') {
						for (i = 0, l = thisMinute.length; i < l; i += 1) {
							text.push(thisMinute[i]);
							textArr.push(this.vars.minute[thisMinute[i]]);
						}
					} else {
						text.push(thisMinute);
						textArr.push(this.vars.minute[thisMinute]);
					}

					text.push('to');
					textArr.push(this.vars.minute.to);

					hours += 1;
				}
			}

			if (!hours) {
				hours = 12;
			}

			text.push(hour[hours - 1]);
			textArr.push(this.vars.hour[hour[hours - 1]]);

			if (!theMinute) {
				text.push('oclock');
				textArr.push(this.vars.text.oclock);
			}

			this.setFace(textArr);

			text = text.join(' ');
			console.log(text, tick);

			return this;
		},
		clearFace: function () {
			var clears = ['text', 'minute', 'hour'],
				i,
				j;

			for (i in clears) {
				if (clears.hasOwnProperty(i)) {
					for (j in this.vars[clears[i]]) {
						if (this.vars[clears[i]].hasOwnProperty(j)) {
							this.removeClass(this.vars[clears[i]][j], 'active');
						}
					}
				}
			}
		},
		setFace: function (textArr) {
			var i = 0,
				l = 0;

			this.clearFace();

			for (i = 0, l = textArr.length; i < l; i += 1) {
				this.addClass(textArr[i], 'active');
			}
		},
		setTicks: function (tick) {
			var ticks = this.vars.ticks,
				i = 0,
				l = 0;

			for (i = 0, l = ticks.length; i < l; i += 1) {
				this.removeClass(ticks[i], 'active');
			}

			if (!tick) {
				return;
			}

			for (i = 0, l = tick; i < l; i += 1) {
				this.addClass(ticks[i], 'active');
			}

			return;
		},
		clock: function (start) {
			var $this = qlock,
				alarms = $this.alarms,
				i = 0,
				l = 0;

			start = start || 60;

			$this.setTime();

			$this.tm = clearTimeout($this.tm);

			$this.tm = setTimeout(function () {
				$this.clock();

				if (alarms.length) {
					for (i = 0, l = alarms.length; i < l; i += 1) {
						$this.alarmClock(alarms[i]);
					}
				}
			}, start * 1000);

			return $this;
		},
		sync: function (callback) {
			var d = new Date().getSeconds(),
				nd = 0;

			while (d + 1 > nd) {
				nd = new Date().getSeconds();
			}

			callback(60 - d);

			return this;
		},
		menu: function () {
			var win = {};

			if (typeof gui.Window !== 'object') {
				return this;
			}

			win = gui.Window.get();
			this.mainMenu = new gui.Menu({
				type: 'menubar'
			});

			this.themesMenu().alarmsMenu().sizesMenu();

			win.menu = this.mainMenu;

			return this;
		},
		loadingDone: function () {
			var container = document.getElementById('qlock'),
				className = '';

			container.className = className.replace('loading', '');

			return this;
		},
		loadJSON: function (url, callback) {
			fs.readFile(url, function (err, data) {
				if (err) {
					console.log('Could not load:', url);
					return;
				}

				callback(JSON.parse(data.toString()));
			});
		},
		events: function () {
			window.onkeyup = this.keyup;

			return this;
		},
		keyup: function (e) {
			var $this = qlock,
				keyCode = e.keyCode;

			if (49 <= keyCode && keyCode <= 57) {
				$this.themesKeyup(keyCode);
			}

			if (65 <= keyCode && keyCode <= 90) {
				$this.sizesKeyup(keyCode);
			}

			return;
		},
		init: function () {
			var $this = this;

			if (!this.setup()) {
				return;
			}

			this.loadThemes('themes.json', function () {
				$this.loadSizes('sizes.json', function () {
					$this.loadingDone();
					$this.menu().sync($this.clock).events();
				});
			});

			return;
		}
	};

	window.qlock = qlock;
}(document, window));