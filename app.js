/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var socketUrl;
var socketSession;
systemLang = 'en';

$.extend(systemDictionary, {
    'Ok':           {'en': 'Ok',                'de': 'Ok',                 'ru': 'Ok'},
    'Cancel':       {'en': 'Cancel',            'de': 'Abbrechen',          'ru': 'Отмена'},
    'Settings':     {'en': 'Settings',          'de': 'Einstellungen',      'ru': 'Настройки'},
    'Language':     {'en': 'Language',          'de': 'Language/Sprache',   'ru': 'Language/Язык'},
    'Socket':       {'en': 'ioBroker socket',   'de': 'ioBroker socket',    'ru': 'ioBroker сокет'},
    'System':       {'en': 'system',            'de': 'System',             'ru': 'системный'},
    'Reload':       {'en': 'Reload',            'de': 'Neuladen',           'ru': 'Обновить'},
    'Re-sync':      {'en': 'Re-sync',           'de': 'Re-sync',            'ru': 'Синхр.'},
    'Instance':     {'en': 'Instance',          'de': 'Instanz',            'ru': 'Идентификатор'},
    'Not found':    {'en': 'Not found',         'de': 'Nicht gefunden',     'ru': 'не найден'},
    'Connected':    {'en': 'Connected',         'de': 'Verbunden',          'ru': 'Соединение'},
    "Project":      {"en": "Project",           "de": "Projekt",            "ru": "Проект"},
    "yes":          {"en": "yes",               "de": "ja",                 "ru": "есть"},
    "no":           {"en": "no",                "de": "nein",               "ru": "нет"},
    "Keyword":      {"en": "Keyword",           "de": "Schlüsselwort",      "ru": "Ключевое слово"},
    "WIFI":         {"en": "WiFi Connection",   "de": "WiFi Verbindung",    "ru": "WiFi соединение"},
    "WIFI SSID":    {"en": "Network name (SSID)", "de": "SSID Name",        "ru": "Имя сети (SSID)"},
    "WIFI Socket":  {"en": "Socket URL",        "de": "Socket URL",         "ru": "Socket URL"},
    "WIFI User":    {"en": "User",              "de": "Anwender",           "ru": "Пользователь"},
    "WIFI Password": {"en": "Password",         "de": "Kennwort",           "ru": "Пароль"},
    "WIFI Password repeat": {
        "en": "Password repeat",
        "de": "Kennwort-Wiederholung",
        "ru": "Повтор пароля"
    },
    "Actual":       {"en": "<=",                "de": "<=",                 "ru": "<="},
    "Cell":         {"en": "Cell Connection",   "de": "Mobile Verbindung",  "ru": "Мобильное соединение"},
    "Cell Socket":  {"en": "Socket URL",        "de": "Socket URL",         "ru": "Socket URL"},
    "Cell User":    {"en": "Cell User",         "de": "Anwender",           "ru": "Пользователь"},
    "Cell Password": {"en": "Cell Password",    "de": "Kennwort",           "ru": "Пароль"},
    "Cell Password repeat": {
        "en": "Password repeat",
        "de": "Kennwort-Wiederholung",
        "ru": "Повтор пароля"
    },
    "Speech recognition": {
        "en": "Speech recognition",
        "de": "Spracherkennung",
        "ru": "Распознавание речи"
    },
    "Allow window move": {
            "en": "Allow window move",
        "de": "Erlaube Fensterverschiebung",
        "ru": "Разрешить сдвиг окна"
    },
    "Prevent from sleep": {
        "en": "Prevent from sleep",
        "de": "Nicht einschlafen",
        "ru": "Не засыпать"
    }
});

var app = {
    settings: {
        socketUrl:      'http://localhost:8084',
        systemLang:     navigator.language || navigator.userLanguage || 'en',
        noSleep:        false,
        project:        '',
        resync:         false,
        instance:       null,
        allowMove:      false,
        recognition:    false,
        text2command:    0,
        defaultRoom:    ''
    },
    connection: '',
    projects:   [],
    ssid:       null,
    localDir:   null,
    // Application Constructor
    initialize:     function () {
        if (this.settings.systemLang.indexOf('-') != -1) {
            this.settings.systemLang = this.settings.systemLang.split('-')[0];
            systemLang = this.settings.systemLang;
        }

        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    receivedEvent: function (event) {
        console.log('Received Event: ' + event);
    },

    getLocalDir:    function (dir, create, cb, index) {
        if (typeof create === 'function') {
            index  = cb;
            cb     = create;
            create = true;
        }

        if (!app.localDir) {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirHandler) {
                app.localDir = dirHandler;
                app.getLocalDir(dir, create, cb);
            });
            return;
        }

        if (create) {
            index = index || 0;
            var parts = dir.split('/');

            app.localDir.getDirectory(parts[index], {
                create:    true,
                exclusive: false
            }, function (dirHandler) {
                if (parts.length - 1 == index) {
                    cb(null, dirHandler);
                } else {
                    app.getLocalDir(dir, create, cb, index + 1);
                }
            }, function (error) {
                cb(error);
            });
        } else {
            app.localDir.getDirectory(dir, {
                create:    false,
                exclusive: false
            }, function (dirHandler) {
                cb(null, dirHandler);
            }, function (error) {
                cb(error);
            });
        }
    },
    writeLocalFile: function (fileName, data, cb) {
        var parts = fileName.split('/');
        var fileN = parts.pop();
        this.getLocalDir(parts.join('/'), true, function (error, dirHandler) {
            if (error) console.error(error);
            if (dirHandler) {
                dirHandler.getFile(fileN, {create: true}, function (fileHandler) {
                    fileHandler.createWriter(function (fileWriter) {
                        try {
                            fileWriter.truncate(0);
                            fileWriter.write(new Blob([data], {type: 'text/plain'}));
                        } catch (e) {
                            console.error(fileWriter.nativeURL + ': ' + e);
                            cb(e);
                            return;
                        }
                        cb();
                    }, function (error) {
                        cb(error);
                        console.error('Cannot write file: ' + error);
                    });
                }, function (error) {
                    cb(error);
                    console.error('Cannot create file')
                });
            } else {
                console.error('Directory "' + fileName + '" not found');
                cb(error || 'Directory not found');
            }
        });
    },
    readLocalFile:  function (fileName, cb) {
        var parts = fileName.split('/');
        var fileN = parts.pop();

        this.getLocalDir(parts.join('/'), false, function (error, dir) {
            if (dir) {
                dir.getFile(fileN, {create: false}, function (fileEntry) {
                    fileEntry.file(function(file) {
                        var reader = new FileReader();

                        reader.onloadend = function(e) {
                            cb(null, this.result, fileName);
                        };

                        reader.readAsText(file);
                    });
                }, function (error) {
                    if (fileName.indexOf('vis-views.json') !== -1) {
                        cb(_('Not found'), '', fileName);
                    } else {
                        cb(error, null, fileName);
                        console.error('Cannot read file: ' + error);
                    }
                });
            } else {
                if (fileName.indexOf('vis-views.json') !== -1) {
                    cb(_('Not found'), '', fileName);
                } else {
                    cb(error, null, fileName);
                    console.error('Cannot read file: ' + error);
                }
            }
        });
    },
    deleteLocalFile: function (fileName, cb) {
        var parts = fileName.split('/');
        var fileN = parts.pop();
        this.getLocalDir(parts.join('/'), true, function (error, dirHandler) {
            if (error) console.error(error);
            if (dirHandler) {
                dirHandler.getFile(fileN, {create: false}, function (fileHandler) {
                    fileHandler.remove(function () {
                        cb();
                    }, function (error) {
                        cb(error);
                        console.error('Cannot delete file: ' + error);
                    });
                }, function (error) {
                    cb(error);
                    console.error('Cannot create file')
                });
            }
        });
    },

    onDeviceReady: function () {
        app.receivedEvent('deviceready');

        /*app.writeLocalFile('main/imgavSony.png', 'text', function (error) {
            app.readLocalFile('main/imgavSony.png', function (error, result) {
                if (error) console.error(error);
                if (!result || app.settings.resync) {

                }
            });
        });*/

        app.connection = navigator.network ? navigator.network.connection.type : undefined;
        document.addEventListener('online', function () {
            if (navigator.network && navigator.network.connection.type !== app.connection) {
                window.location.reload();
            }
        }, false);

        app.loadSettings(function () {
            if (window.plugins.insomnia) {
                if (app.settings.noSleep) {
                    window.plugins.insomnia.keepAwake();
                } else {
                    window.plugins.insomnia.allowSleepAgain();
                }
            }

            app.installMenu();
            // because of different translation
            app.yes = _('yes');
            app.no  = _('no');
            app.loadCss();

            if (app.settings.project) {
                app.readLocalFile(app.settings.project + '/vis-views.json', function (error, result) {
                    if (error) console.error(error);
                    if (!result || app.settings.resync) {
                        app.syncVis(app.settings.project, function () {
                            app.settings.resync = false;
                            app.saveSettings();
                            if (!app.viewExists) {
                                window.alert(_('No views found in %s', app.settings.project));
                            } else {
                                window.location.reload();
                            }
                        });
                    }
                });
            }

            if (!app.settings.project || app.settings.socketUrl == 'http://localhost:8084') {
                $('#cordova_menu').trigger('click');
            }

            if (!app.settings.allowMove) {
                /*$('#vis_container').css({
                    "-webkit-touch-callout":        "none",
                    "-ms-touch-select":             "none",
                    "-ms-touch-action":             "none",
                    "-webkit-tap-highlight-color":  "rgba(0,0,0,0)",
                    "touch-callout":                "none",
                    "touch-select":                 "none",
                    "touch-action":                 "none",
                    "-webkit-user-select":          "none",
                    "-khtml-user-select":           "none",
                    "-moz-user-select":             "none",
                    "-ms-user-select":              "none",
                    "user-select":                  "none",
                    "border":                       "none !important"
                });*/
            }
            $('.vis-wait-text').css({left: 0, 'padding-left': '1em'});

            app.initSpeechRecognition();
            app.manageDisplayRotation();

            // init vis
            main(jQuery);
        });
    },

    loadSettings:   function (cb) {
        if (typeof Storage  !== 'undefined') {
            var value   = localStorage.getItem('cordova');
            var delayed = false;
            if (value) {
                try {
                    value = JSON.parse(value);
                } catch (error) {
                    console.error('Cannot parse settings');
                    value = {};
                }
            } else {
                value = {};
            }
            this.settings = $.extend(this.settings, value);

            systemLang   = this.settings.systemLang || navigator.language || navigator.userLanguage;

            if (this.settings.socketUrlGSM && navigator.network && navigator.network.connection.type != 'wifi') {
                socketUrl = this.settings.socketUrlGSM + (this.settings.userGSM ? '/?user=' + this.settings.userGSM + '&pass=' + this.settings.passwordGSM : '');
            } else {
                // If WIFI and SSID is set
                if (navigator.wifi) {
                    // read SSID info
                    delayed = true;
                    navigator.wifi.getWifiInfo(function (data) {
                        app.ssid = data.connection.SSID;
                        if (this.settings.socketUrlGSM && app.settings.ssid && data.connection.SSID != app.settings.ssid) {
                            // other wifi network
                            socketUrl = this.settings.socketUrlGSM + (this.settings.userGSM ? '/?user=' + this.settings.userGSM + '&pass=' + this.settings.passwordGSM : '');
                        } else {
                            socketUrl = this.settings.socketUrl + (this.settings.user ? '/?user=' + this.settings.user + '&pass=' + this.settings.password : '');
                        }
                        cb && cb();
                    }.bind(this), function (error) {
                        socketUrl = this.settings.socketUrl + (this.settings.user ? '/?user=' + this.settings.user + '&pass=' + this.settings.password : '');
                        console.error(error);
                    }.bind(this));
                } else {
                    socketUrl = this.settings.socketUrl + (this.settings.user ? '/?user=' + this.settings.user + '&pass=' + this.settings.password : '');
                }
            }

            // generate new Instance
            if (!this.settings.instance) {
                this.settings.instance = (Math.random() * 4294967296).toString(16);
                this.settings.instance = '0000000' + this.settings.instance;
                this.settings.instance = this.settings.instance.substring(this.settings.instance.length - 8);
            }
        } else {
            console.error('no Storage object!');
        }
        if (!delayed && cb) cb();
    },
    saveSettings:   function () {
        if (typeof(Storage) !== 'undefined') {
            localStorage.setItem('cordova', JSON.stringify(this.settings));
        }
    },

    readProjectsHelper: function (project, cb) {
        vis.conn.readFile(project + '/vis-views.json', function (error, data, filename) {
            if (cb) {
                project = data ? project : null;
                // give time for other tasks
                setTimeout(function () {
                    cb(project);
                }, 50);
            }
        }, true);
    },
    readProjects:   function (cb) {
        if (vis.conn.getIsConnected()) {
            app.projects = [];
            $('#cordova_project').html('');
            vis.conn.readDir('/vis.0', function (error, files) {
                var count = 0;
                for (var f = 0; f < files.length; f++) {
                    if (files[f].isDir) {
                        count++;
                        app.readProjectsHelper(files[f].file, function (project) {
                            if (project) {
                                app.projects.push(project);
                                $('#cordova_project').append('<option value="' + project + '" ' + (project == app.settings.project ? 'selected' : '') + '>' + project + '</option>');
                            }
                        });
                    }
                }
                if (!--count && cb) cb();
            });
        } else {
            setTimeout(function () {
                this.readProjects(cb);
            }.bind(this), 500);
        }
    },

    copyFilesToDevice: function (files, cb, total) {
        if (total === undefined) total = files.length;

        if (!files || !files.length) {
            if (cb) setTimeout(cb, 0);
            return;
        }
        var file = files.pop();

        vis.conn.readFile(file, function (error, data, filename) {
            if (error) console.error(error);
            $('#cordova_progress_show').css('width', (100 - (files.length / total) * 100) + '%');

            if (data) {
                // modify vis-views.json
                if (filename && filename.indexOf('vis-views.json') != -1) {
                    app.viewExists = true;
                    var m = data.match(/"\/vis\.0\/.+"/g);
                    if (m) {
                        for (var mm = 0; mm < m.length; mm++) {
                            //file:///data/data/net.iobroker.vis/files/main/vis-user.css
                            //cdvfile://localhost/persistent
                            var fn = m[mm].substring(8);
                            var p  = fn.split('/');

                            fn  = p.shift();
                            fn += p.length ? '/' + p.join('') : '';

                            data = data.replace(m[mm], '"file:///data/data/net.iobroker.vis/files/' + fn);
                        }
                    }

                    m = data.match(/"\/vis\/.+"/g);
                    if (m) {
                        for (var mm = 0; mm < m.length; mm++) {
                            data = data.replace(m[mm], '"' + m[mm].substring(6));
                        }
                    }
                }

                // remove subdirs
                var p = filename.replace(/^\/vis\.0\//, '').split('/');
                filename = p.shift();
                filename += p.length ? '/' + p.join('') : '';

                this.writeLocalFile(filename, data, function (error) {
                    if (error) console.error(error);
                    setTimeout(function () {
                        this.copyFilesToDevice(files, cb, total);
                    }.bind(this), 0);
                }.bind(this));
            } else {
                setTimeout(function () {
                    this.copyFilesToDevice(files, cb, total);
                }.bind(this), 0);
            }
        }.bind(this), true);
    },
    deleteFilesFromDevice: function (files, cb) {
        if (!files || !files.length) {
            if (cb) setTimeout(cb, 0);
            return;
        }
        var file = files.pop();
        this.deleteLocalFile(file, function (error) {
            if (error) console.error(error);
            setTimeout(function () {
                this.copyFilesToDevice(files, cb, total);
            }.bind(this), 0);
        });
    },
    readRemoteProject: function (dir, cb, _files) {
        dir    = dir    || '';
        _files = _files || [];

        // if start => reset flag
        if (!dir || dir.indexOf('/') == -1) this.viewExists = false;

        if (vis.conn.getIsConnected()) {
            vis.conn.readDir('/vis.0/' + dir, function (error, files) {
                if (files) {
                    var count = 0;
                    for (var f = 0; f < files.length; f++) {
                        if (files[f].isDir) {
                            count++;
                            this.readRemoteProject(dir + '/' + files[f].file, function () {
                                if (!--count) {
                                    setTimeout(function () {
                                        cb(_files);
                                    }, 0);
                                }
                            }, _files);
                        } else {
                            _files.push(dir + '/' + files[f].file);
                        }
                    }

                    if (!count) {
                        setTimeout(function () {
                            cb(_files);
                        }, 0);
                    }
                } else {
                    setTimeout(function () {
                        cb(_files);
                    }, 0);
                }
            }.bind(this));
        } else {
            // waiting till connected
            setTimeout(function () {
                this.readRemoteProject(dir, cb, _files);
            }.bind(this), 500);
        }
    },
    syncVis:        function (project, cb) {
        if (!$('#cordova_progress').length) {
            $('body').append('<div id="cordova_progress" style="position: absolute; z-index: 5003; top: 50%; left: 5%; width: 90%; height: 2em; background: gray">' +
                '<div id="cordova_progress_show" style="height: 100%; width: 0; background: lightblue"></div></div>');
        }
        $('#cordova_dialog_bg').show();

        if (vis.conn.getIsConnected()) {
            // read common css file
            vis.conn._socket.emit('readFile', 'vis', 'css/vis-common-user.css', function (err, data) {
                setTimeout(function () {
                    this.writeLocalFile('vis-common-user.css', data || '', function (error) {
                        if (error) console.error(error);
                        this.readRemoteProject(project, function (files) {
                            this.copyFilesToDevice(files, function () {
                                $('#cordova_progress').remove();
                                $('#cordova_dialog_bg').hide();
                                if (cb) cb();
                            });
                        }.bind(this));
                    }.bind(this));
                }.bind(this), 0);
            }.bind(this));
        } else {
            setTimeout(function () {
                this.syncVis(project, cb);
            }.bind(this), 500);
        }
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    tts:            function (data, cb) {
        // text:    'hello, world!',
        // locale:  'en-GB',
        // rate:    0.1 - 10
        // volume: from 0 to 100
        // pitch: 0 -2

        if (!app.ttsText) {
            $('body').append('<div id="cordova_tts_text" style="border-radius: 1em; padding: 0.2em;position: absolute; z-index: 5000; background: lightgreen; top: 3em; left: 3em; font-size: 1.5em"></div>');
            app.ttsText = $('#cordova_tts_text');
        }

        if (data[0] == '{') {
            var obj;
            try {
                obj = JSON.parse(data);
            } catch (err) {

            }
            if (obj) data = obj;
        }
        if (typeof data === 'string') {
            if (data.indexOf(';') != -1) {
                var parts = data.split(';');
                data = {};
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i] == 'en' || parts[i] == 'de' || parts[i] == 'ru') {
                        data.locale = parts[i];
                    } else if (parseInt(parts[i], 10) == parts[i]) {
                        data.volume = parseInt(parts[i], 10) / 100;
                    } else {
                        data.text = (data.text ? ';' : '') + parts[i];
                    }
                }
            } else {
                data = {
                    text:   data,
                    locale: app.settings.systemLang
                };
            }
        }
        if (data.language) data.locale = data.language;
        if (data.lang)     data.locale = data.lang;

        if (data.locale == 'en') data.locale = 'en-GB';
        if (data.locale == 'de') data.locale = 'de-DE';
        if (data.locale == 'ru') data.locale = 'ru-RU';

        if (app.settings.project && app.settings.recognition) {
            app.menu.css('background', 'rgba(0, 0, 0, 0.1)');
            app.recognition.stop();
        }
        if (app.ttsTextTimer) clearTimeout(app.ttsTextTimer);
        app.ttsText.html(data.text).show();
        app.ttsTextTimer = setTimeout(function () {
            app.ttsText.hide();
            app.ttsTextTimer = null;
        }, 3000);

        if (TTS) {
            TTS.speak(data, function () {
                console.log(JSON.stringify(data));

                if (app.settings.project && app.settings.recognition) {
                    app.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                    app.recognition.start();
                }
                cb && cb();
            }, function (reason) {
                console.error(reason);
            });
        }
    },

    initSpeechRecognition: function () {
        if (app.settings.project && app.settings.recognition && (app.settings.text2command || app.settings.text2command === 0)) {
            $('body').append('<div id="cordova_show_recognized" style="display:none; padding: 0.2em; border-radius: 0.4em;position: absolute; z-index: 5000; background: lightskyblue; top: 1em; left: 3em; font-size: 1.5em;"></div>');
            app.recText = $('#cordova_show_recognized');

            app.recognition = new SpeechRecognition();
            app.recognition.maxAlternatives = 3;
            app.recognition.continuous      = true;
            app.recognition.interimResults  = true;
            app.recognition.lang            = app.settings.systemLang;
            if (app.settings.keyword) {
                app.settings.keyword = app.settings.keyword.trim();
                app.settings.keyword = app.settings.keyword.replace(/\s\s/g, ' ');
                app.match = [
                    new RegExp('\\s' + app.settings.keyword + '\\s', 'i'),
                    new RegExp('^'   + app.settings.keyword + '\\s', 'i'),
                    new RegExp('\\s' + app.settings.keyword + '$',   'i'),
                    new RegExp('^'   + app.settings.keyword + '$',   'i')
                ];
            }
            app.recognition.onresult = function(event) {
                var matched = false;
                if (event.results.length > 0) {
                    var text = event.results[0][0].transcript;
                    app.recText.html(text).show();
                    if (event.results[0][0].final) {
                        app.recText.css('background: lightblue');
                        // start analyse
                        if (app.match) {
                            for (var m = 0; m < app.match.length; m++) {
                                if (app.match[m].test(text)) {
                                    text = text.replace(app.match[m], '').replace(/\s\s/g, ' ').trim();
                                    // Key phrase found
                                    matched = true;
                                    break;
                                }
                            }
                        } else {
                            matched = true;
                        }
                        if (matched) {
                            if (app.settings.defaultRoom) {
                                text = text + ' [' + app.settings.defaultRoom + ']';
                                if (!app.defaultRoomRegExp) app.defaultRoomRegExp = new RegExp('\\s\\[' + app.settings.defaultRoom + '\\]', 'i');
                            }
                            // restart recognition if text2command inactive
                            var timeout = setTimeout(function () {
                                app.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                                app.recognition.start(false);
                            }, 1000);

                            vis.conn._socket.emit('sendTo', 'text2command.' + app.settings.text2command, 'send', text, function (response) {
                                // stop timeout if no text2command
                                if (timeout) {
                                    clearTimeout(timeout);
                                    timeout = null;
                                }
                                response.response = response.response || '';
                                if (app.settings.defaultRoom) {
                                    response.response = response.response.replace(app.defaultRoomRegExp, '');
                                }

                                // say answer
                                app.tts(response.response, function () {
                                    // Start recognition
                                    setTimeout(function () {
                                        app.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                                        app.recognition.start(false);
                                    }, 500);
                                });
                            }.bind(this));
                        }
                    } else {
                        app.recText.css('background: darkblue');
                    }

                    if (app.recTextTimeout) clearTimeout(app.recTextTimeout);

                    app.recTextTimeout = setTimeout(function () {
                        app.recTextTimeout = null;
                        app.recText.hide();
                    }, 2000);
                }
                if (!matched) {
                    setTimeout(function () {
                        app.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                        app.recognition.start(false);
                    }, 100);
                }
            };
            app.recognition.onend = function(event) {
                app.menu.css('background', 'rgba(0, 0, 0, 0.1)');
            };
            app.recognition.onerror = function(event) {
                console.log(JSON.stringify(event));
                app.menu.css('background', 'rgba(0, 0, 0, 0.1)');
                setTimeout(function () {
                    app.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                    app.recognition.start(true);
                }, 300);
            };

            app.recognition.ondebug = function (event) {
                console.log(JSON.stringify(event));
            };
            app.menu = $('#cordova_menu');
            app.menu.css('background', 'rgba(0, 0, 128, 0.5)');
            app.recognition.start(false);
        }
    },

    manageDisplayRotation: function () {
        // Manage rotation
        app.window = {
            orientation: window.orientation,
            width:       window.innerWidth,
            height:      window.innerHeight
        };

        window.onorientationchange = function() {
            var viewport_scale;

            if (window.orientation == 0 || window.orientation == 180) {
                if (app.window.orientation == 0 || app.window.orientation == 180) {
                    // landscape
                    viewport_scale = 1;
                } else {
                    // portrait
                    viewport_scale = app.window.width / app.window.height;
                }
            } else if (window.orientation == 90 || window.orientation == -90) {
                if (app.window.orientation == 90 || app.window.orientation == -90) {
                    // landscape
                    viewport_scale = 1;
                } else {
                    // portrait
                    viewport_scale = app.window.width / app.window.height;
                }
            }

            // resize viewport
            $('meta[name=viewport]').attr('content',
                'width=' + app.window.width + ',' +
                'minimum-scale=' + viewport_scale + ', maximum-scale=' + viewport_scale);
        };
        // resize viewport
        $('meta[name=viewport]').attr('content',
            'width=' + app.window.width + ',' +
            'minimum-scale=1, maximum-scale=1');
    },
    loadCss:        function () {
        if (app.settings.project) {
            this.readLocalFile(app.settings.project + '/vis-user.css', function (error, data) {
                if (data) {
                    $('head').append('<style id="vis-user" class="vis-user">' + data + '</style>');
                }
                $(document).trigger('vis-user');
            });
        }

    },
    installMenu:    function () {
        // install menu button
        $('body').append('<div id="cordova_menu"   style="top: 0.5em; left: 0.5em; padding-left: 0.5em; padding-right: 0.5em; position: absolute; background: rgba(0,0,0,0.1); border-radius: 20px; z-index: 5001" id="cordova_menu">...</div>');
        $('body').append('<div id="cordova_dialog_bg" style="position: absolute; top:0; right: 0; left: 0; bottom: 0; background: black; opacity: 0.3; display: none; z-index: 5002"></div>' +
            '<div id="cordova_dialog" style="background: #d3d3d3; top: 1em; left: 1em; bottom: 1em; right: 1em; position: absolute; border-radius: 0.3em; border: 1px solid grey; display: none; z-index: 5003; overflow-x: hidden; overflow-x' +
            'y: auto">' +
            '<div style="padding-left: 1em; font-size: 2em; font-weight: bold">' + _('Settings') +
            '<span style="padding-left: 1em; font-size: 0.5em" id="cordova_version"></span>' + '</div>' +
            '<table style="width: 100%; padding: 1em">' +

            '<tr><td colspan="2">' +
            '<button id="cordova_reload">' + _('Reload')  + '</button>' +
            '<button id="cordova_resync">' + _('Re-sync') + '</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            '<button id="cordova_ok">'     + _('Ok')      + '</button>&nbsp;' +
            '<button id="cordova_cancel">' + _('Cancel')  + '</button></td></tr>'+

            '<tr><td>' + _('Connected') + ':</td><td><div id="cordova_connected"></div></td></tr>'+
            '<tr><td>' + _('Language') + ':</td><td><select data-name="systemLang" class="cordova-setting" style="width: 100%">' +
                '<option value="">' + _('System') + '</option>' +
                '<option value="en">english</option>' +
                '<option value="de">deutsch</option>' +
                '<option value="ru">русский</option>' +
            '</select></td></tr>'+
            '<tr><td>' + _('Project')               + ':</td><td><select class="cordova-setting" data-name="project"     id="cordova_project" style="width: 100%"></select>' +
            '<tr><td>' + _('Prevent from sleep')    + ':</td><td><input  class="cordova-setting" data-name="noSleep"     type="checkbox"/></td></tr>'+
            '<tr><td>' + _('Allow window move')     + ':</td><td><input  class="cordova-setting" data-name="allowMove"   type="checkbox"/></td></tr>'+
            '<tr><td>' + _('Speech recognition')    + ':</td><td><input  class="cordova-setting" data-name="recognition" type="checkbox"/></td></tr>'+
            '<tr class="speech"><td>' + _('Keyword')               + ':</td><td><input  class="cordova-setting" data-name="keyword"     style="width: 100%"/>' +
            '<tr class="speech"><td>' + _('Text 2 speech')         + ':</td><td><select id="text2command" class="cordova-setting" data-name="text2command" style="width: 100%"></select>' +
            '<tr class="speech"><td>' + _('Default room')          + ':</td><td><select id="defaultRoom" class="cordova-setting" data-name="defaultRoom" style="width: 100%"></select>' +
            '<tr><td>' + _('Instance')              + ':</td><td><input  class="cordova-setting" data-name="instance"    style="width: 100%"/></td></tr>'+
            '<tr><td colspan="2" style="background: darkgrey; color: white; font-weight: bold">' + _('WIFI') + '</td></tr>'+
            '<tr><td>' + _('WIFI SSID')             + ':</td><td><input  class="cordova-setting" data-name="ssid"       style="width: calc(100% - 2em)" id="cordova_ssid"/><button id="cordova_ssid_button" style="width: 3em">' + _('Actual') + '</button></td></tr>'+
            '<tr><td>' + _('WIFI Socket')           + ':</td><td><input  class="cordova-setting" data-name="socketUrl"  style="width: 100%"/></td></tr>'+
            '<tr><td>' + _('WIFI User')             + ':</td><td><input  class="cordova-setting" data-name="user"       style="width: 100%"/></td></tr>'+
            '<tr><td>' + _('WIFI Password')         + ':</td><td><input  class="cordova-setting" data-name="password"   type="password" id="cordova-password" style="width: 100%"/></td></tr>'+
            '<tr><td>' + _('WIFI Password repeat')  + ':</td><td><input  id="cordova-password-repeat" type="password"   style="width: 100%"/></td></tr>'+
            '<tr><td colspan="2" style="background: darkgrey; color: white; font-weight: bold">' + _('Cell')      + '</td></tr>'+
            '<tr><td>' + _('Cell Socket')           + ':</td><td><input  class="cordova-setting" data-name="socketUrlGSM" style="width: 100%"/></td></tr>'+
            '<tr><td>' + _('Cell User')             + ':</td><td><input  class="cordova-setting" data-name="userGSM"    style="width: 100%"/></td></tr>'+
            '<tr><td>' + _('Cell Password')         + ':</td><td><input  class="cordova-setting" data-name="passwordGSM" type="password" id="cordova-password-gsm" style="width: 100%"/></td></tr>'+
            '<tr><td>' + _('Cell Password repeat')  + ':</td><td><input  id="cordova-password-repeat-gsm" type="password" style="width: 100%"/></td></tr>'+
            '</select></td></tr>'+
            '</table></div>');

        cordova.getAppVersion.getVersionNumber().then(function (version) {
            $('#cordova_version').text(version);
        });

        // todo read text2command instances
        // todo read rooms

        $('#cordova_menu').click(function () {
            // load settings
            $('#cordova_dialog .cordova-setting').each(function() {
                if ($(this).attr('type') === 'checkbox') {
                    $(this).prop('checked', app.settings[$(this).data('name')]);
                    if ($(this).data('name') === 'recognition' && !app.settings.recognition) {
                        $('.speech').hide();
                    }
                } else {
                    $(this).val(app.settings[$(this).data('name')]);
                }
            });

            // todo read text2command instances
            if (vis.conn) {
                vis.conn._socket.emit('getObjectView', 'system', 'instance', {startkey: 'system.adapter.text2command.', endkey: 'system.adapter.text2command.\u9999'}, function (err, res) {
                    if (!err && res.rows.length) {
                        var text = '<option value="">' + _('none') + '</option>';
                        for (var i = 0; i < res.rows.length; i++) {
                            text += '<option value="' + res.rows[i].id.substring('system.adapter.text2command.'.length) + '">' + res.rows[i].id.substring('system.adapter.text2command.'.length) + '</option>';
                        }
                        $('#text2command').html(text).val(app.settings.text2command);
                    }
                    vis.conn._socket.emit('getObjectView', 'system', 'enum', {startkey: 'enum.rooms.', endkey: 'enum.rooms.\u9999'}, function (err, res) {
                        if (!err && res.rows.length) {
                            var text = '<option value="">' + _('none') + '</option>';
                            for (var i = 0; i < res.rows.length; i++) {
                                text += '<option value="' + res.rows[i].value.common.name + '">' + res.rows[i].value.common.name + '</option>';
                            }
                            $('#defaultRoom').html(text).val(app.settings.defaultRoom);
                        }
                    });
                });
            }

            if (app.ssid) {
                $('#cordova_ssid_button').show();
                $('#cordova_ssid').css('width', 'calc(100% - 3.5em)');
            } else {
                $('#cordova_ssid_button').hide();
                $('#cordova_ssid').css('width', '100%');
            }
            $('#cordova-password-repeat').val($('#cordova-password').val());
            $('#cordova-password-repeat-gsm').val($('#cordova-password-gsm').val());

            $('input[data-name="recognition"]').unbind('change').change(function () {
                if ($(this).prop('checked')) {
                    $('.speech').show();
                } else {
                    $('.speech').hide();
                }
            });

            $('#cordova_ssid_button').unbind('click').click(function () {
                $('#cordova_ssid').val(app.ssid);
            });

            $('#cordova_cancel').unbind('click').click(function () {
                $('#cordova_dialog_bg').hide();
                $('#cordova_dialog').hide();
            }).css({height: '2em'});

            $('#cordova_reload').unbind('click').click(function () {
                var changed = false;
                // save settings
                $('#cordova_dialog .cordova-setting').each(function() {
                    if ($(this).attr('type') === 'checkbox') {
                        if (app.settings[$(this).data('name')] != $(this).prop('checked')) {
                            changed = true;
                            return false;
                        }
                    } else {
                        if (app.settings[$(this).data('name')] != $(this).val()) {
                            changed = true;
                            return false;
                        }
                    }
                });

                if (changed && !window.confirm(_('Discard changes?'))) return;

                $('#cordova_dialog_bg').hide();
                $('#cordova_dialog').hide();
                window.location.reload();
            }).css({height: '2em'});

            $('#cordova_resync').unbind('click').click(function () {
                var changed = false;

                // save settings
                $('#cordova_dialog .cordova-setting').each(function() {
                    if ($(this).attr('type') === 'checkbox') {
                        if (app.settings[$(this).data('name')] != $(this).prop('checked')) {
                            changed = true;
                            return false;
                        }
                    } else {
                        if (app.settings[$(this).data('name')] != $(this).val()) {
                            changed = true;
                            return false;
                        }
                    }
                });

                if (changed && !window.confirm(_('Discard changes?'))) return;

                $('#cordova_dialog_bg').hide();
                $('#cordova_dialog').hide();
                app.settings.resync = true;
                app.saveSettings();
                window.location.reload();
            }).css({height: '2em'});

            $('#cordova_ok').unbind('click').click(function () {
                if ($('#cordova-password').val() != $('#cordova-password-repeat').val()) {
                    window.alert(_('WIFI password repeat does not equal to repeat'));
                    return;
                }
                if ($('#cordova-password-gsm').val() != $('#cordova-password-repeat-gsm').val()) {
                    window.alert(_('Cell password repeat does not equal to repeat'));
                    return;
                }

                $('#cordova_dialog_bg').hide();
                $('#cordova_dialog').hide();
                var changed = false;
                var projectChanged = false;

                // save settings
                $('#cordova_dialog .cordova-setting').each(function() {
                    if ($(this).attr('type') === 'checkbox') {
                        if (app.settings[$(this).data('name')] != $(this).prop('checked')) {
                            app.settings[$(this).data('name')] = $(this).prop('checked');
                            changed = true;
                        }
                    } else {
                        if (app.settings[$(this).data('name')] != $(this).val()) {
                            app.settings[$(this).data('name')] = $(this).val();
                            changed = true;
                            if ($(this).data('name') === 'project') projectChanged = true;
                        }
                    }
                });

                if (changed) {
                    // If project name changed
                    if (projectChanged && vis.conn.getIsConnected()) {
                        // try to load all files
                        app.syncVis(app.settings.project, function () {
                            app.settings.resync = false;
                            app.saveSettings();
                            if (!app.viewExists) {
                                window.alert(_('No views found in %s', app.settings.project));
                            } else {
                                window.location.reload();
                            }
                        });
                    } else {
                        app.saveSettings();
                        window.location.reload();
                    }
                }
            }).css({height: '2em'});


            $('#cordova_dialog_bg').show();
            $('#cordova_dialog').show();
        });
    },

    onConnChange: function (connected) {
        if (connected) {
            $('#cordova_connected').html('<span style="color:green">' + app.yes +'</span>');
            if (!app.projects.length) app.readProjects();
        } else {
            $('#cordova_connected').html('<span style="color:red">'   + app.no +'</span>');
        }
    }
};

app.initialize();