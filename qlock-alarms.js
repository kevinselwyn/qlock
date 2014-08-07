/*globals console, document, gui, localStorage, prompt, qlock, setTimeout, window*/

(function (document, window, qlock) {
	'use strict';

	qlock.extend({
		alarms: [],
		alarmSubMenu: {},
		alarmMenuItemNone: {},
		alarmMenuItemSet: {},
		cleanTime: function (time) {
			var date = new Date(time),
				dateTime = date.getTime(),
				newTime = new Date(),
				timeEdit = '',
				hour = 0,
				minute = 0,
				meridian = 'AM',
				parts = [];

			if (!isNaN(dateTime)) {
				return time;
			}

			timeEdit = time.toUpperCase().replace(/\s/g, '');

			if (timeEdit.search('PM') !== -1) {
				meridian = 'PM';
			}

			parts = timeEdit.replace(/(A|P)M/, '').split(':');

			hour = parseInt(parts[0], 10);
			minute = parseInt(parts[1], 10);

			if (meridian === 'AM') {
				if (hour === 12) {
					hour = 0;
				}
			} else {
				if (1 <= hour && hour <= 11) {
					hour += 12;
				}
			}

			newTime.setHours(hour, minute);

			return time;
		},
		alarmsMenu: function () {
			var mainMenu = this.mainMenu,
				alarms = this.alarms,
				alarmSubMenu = {},
				alarmMenuItemNone = {},
				alarmMenuItemSet = {},
				i = 0,
				l = 0;

			alarmSubMenu = new gui.Menu();

			this.alarmSubMenu = alarmSubMenu;

			alarmMenuItemNone = new gui.MenuItem({
				label: 'No Alarms Set',
				enabled: false
			});

			alarmMenuItemSet = new gui.MenuItem({
				label: 'Set Alarm',
				click: this.setAlarm
			});

			if (!alarms.length) {
				alarmSubMenu.append(alarmMenuItemNone);
			} else {
				for (i = 0, l = alarms.length; i < l; i += 1) {
					this.setAlarm(alarms[i]);
				}
			}

			alarmSubMenu.append(alarmMenuItemSet);

			this.alarmMenuItemNone = alarmMenuItemNone;
			this.alarmMenuItemSet = alarmMenuItemSet;

			mainMenu.append(new gui.MenuItem({
				label: 'Alarms',
				submenu: alarmSubMenu
			}));

			return this;
		},
		alarmClock: function (time, themes, offset) {
			var $this = qlock,
				currentTime = new Date(),
				userTime = new Date(time),
				text = ['it', 'is', 'time'],
				textArr = [],
				i,
				j = 0,
				l = 0;

			if (currentTime.getHours() === userTime.getHours()) {
				if (currentTime.getMinutes() === userTime.getMinutes()) {
					themes = themes || [];
					offset = offset || 0;

					if (offset >= themes.length) {
						offset = 0;
					}

					this.setTicks(0);

					for (j = 0, l = text.length; j < l; j += 1) {
						textArr.push(this.vars.text[text[j]]);
					}

					this.setFace(textArr);

					if (!themes.length) {
						for (i in this.themes) {
							if (this.themes.hasOwnProperty(i)) {
								themes.push(i);
							}
						}
					}

					this.setTheme(themes[offset]);

					setTimeout(function () {
						$this.alarmClock(time, themes, offset + 1);
					}, 500);
				} else {
					this.setTheme(this.theme);
				}
			}
		},
		setAlarm: function (alarm, save) {
			var $this = qlock,
				alarms = $this.alarms,
				alarmSubMenu = $this.alarmSubMenu,
				alarmMenuItemNone = $this.alarmMenuItemNone;

			if (typeof alarm !== 'string') {
				alarm = prompt('Set an alarm (ex. 12:34 PM):');
				alarm = $this.cleanTime(alarm);
				save = true;
			}

			if (alarm.length) {
				if (typeof gui.Window === 'object') {
					if (!alarms.length) {
						alarmSubMenu.remove(alarmMenuItemNone);
					}

					alarmSubMenu.insert(new gui.MenuItem({
						label: alarm,
						click: $this.removeAlarm
					}), 0);
				}

				if (save) {
					alarms.push(alarm);
					$this.alarms = alarms;
					$this.saveAlarms();
				}

				console.log('Alarm set:', alarm);
			}

			$this.sync($this.clock);
		},
		removeAlarm: function (alarm) {
			var $this = qlock,
				alarms = $this.alarms,
				alarmIndex = 0,
				alarmSubMenu = $this.alarmSubMenu,
				alarmMenuItemNone = $this.alarmMenuItemNone;

			alarm = typeof alarm === 'string' ? alarm : this.label;

			if (typeof gui.Window === 'object') {
				alarmSubMenu.remove(this);
				if (alarmSubMenu.items.length === 1) {
					alarmSubMenu.insert(alarmMenuItemNone, 0);
				}
			}

			alarmIndex = $this.arraySearch(alarm, alarms);
			alarms.splice(alarmIndex, 1);
			$this.alarms = alarms;
			$this.saveAlarms();

			console.log('Alarm removed:', alarm);
		},
		restoreAlarms: function () {
			var alarms = [];

			if (window.localStorage) {
				alarms = localStorage.getItem('alarms') || '[]';
				alarms = JSON.parse(alarms);
			}

			this.alarms = alarms;
		},
		saveAlarms: function () {
			var alarms = this.alarms;

			if (window.localStorage) {
				alarms = localStorage.setItem('alarms', JSON.stringify(alarms));
			}
		}
	});
}(document, window, qlock));