/*globals document, gui, localStorage, qlock, window*/

(function (document, window, qlock) {
	'use strict';

	qlock.extend({
		size: '',
		sizes: {},
		sizeCount: 0,
		loadSizes: function (url, callback) {
			var $this = this,
				size = '',
				sizeCount = 0;

			this.loadJSON(url, function (sizes) {
				var i;

				for (i in sizes) {
					if (sizes.hasOwnProperty(i)) {
						if (!size.length) {
							size = i;
						}

						sizeCount += 1;
					}
				}

				size = $this.size.length ? $this.size : size;

				$this.size = size;
				$this.sizes = sizes;
				$this.sizeCount = sizeCount;

				$this.setSize(size);

				callback();
			});
		},
		sizesMenu: function () {
			var $this = this,
				mainMenu = this.mainMenu,
				sizes = this.sizes,
				sizesSubMenu = {},
				keys = [],
				i,
				j = 0,
				l = 0;

			sizesSubMenu = new gui.Menu();

			for (i in sizes) {
				if (sizes.hasOwnProperty(i)) {
					keys.push(i);
				}
			}

			for (j = 0, l = keys.length; j < l; j += 1) {
				(function (size) {
					sizesSubMenu.append(new gui.MenuItem({
						label: size,
						click: function () {
							$this.setSize(size);
						}
					}));
				}(keys[j]));
			}

			mainMenu.append(new gui.MenuItem({
				label: 'Sizes',
				submenu: sizesSubMenu
			}));

			return this;
		},
		setSize: function (size) {
			var $this = this,
				sizes = this.sizes,
				style = {},
				css = {},
				rules = [],
				theRulesStr = [],
				win = {},
				width = 0,
				height = 0,
				padding = 22,
				i;

			size = size || '1x';

			this.size = size;

			css = sizes[size].css;

			style = document.getElementById('qlock-size');

			if (!style) {
				style = document.createElement('style');
				style.type = 'text/css';
				style.id = 'qlock-size';
				document.head.appendChild(style);
			}

			for (i in css) {
				if (css.hasOwnProperty(i)) {
					rules.push(this.render(this.templates.selector, {
						selector: i,
						rules: (function (theRules) {
							var j;

							theRulesStr = [];

							for (j in theRules) {
								if (theRules.hasOwnProperty(j)) {
									theRulesStr.push($this.render($this.templates.rule, {
										property: j,
										value: theRules[j]
									}));
								}
							}

							return theRulesStr.join('\n');
						}(css[i]))
					}));
				}
			}

			style.innerHTML = rules.join('\n');

			if (typeof gui.Window === 'object') {
				win = gui.Window.get();

				width = parseInt(sizes[size].width, 10);
				height = parseInt(sizes[size].height, 10);

				height += padding;

				win.resizeTo(width, height);
			}

			this.saveSize();

			return this;
		},
		sizesKeyup: function (keyCode) {
			var alph = keyCode - 65,
				size = '',
				sizes = this.sizes,
				max = 0,
				counter = 0,
				i;

			for (i in sizes) {
				if (sizes.hasOwnProperty(i)) {
					max += 1;
				}
			}

			for (i in sizes) {
				if (sizes.hasOwnProperty(i)) {
					if (counter === alph) {
						size = i;
					}

					counter += 1;
				}
			}

			if (!size.length) {
				size = i;
			}

			if (size && alph < max) {
				this.setSize(size);
			}
		},
		restoreSize: function () {
			var size = '';

			if (window.localStorage) {
				size = localStorage.getItem('size') || '';
			}

			this.size = size;
		},
		saveSize: function () {
			var size = this.size;

			if (window.localStorage) {
				size = localStorage.setItem('size', size);
			}
		}
	});
}(document, window, qlock));