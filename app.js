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
    "Sleep in background": {
        "en": "Sleep in background",
        "de": "Schlaffen, falls inaktiv",
        "ru": "Спать, если не активно"
    },
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
    "Speech recognition active": {
        "en": "Speech recognition active",
        "de": "Spracherkennung aktiviert",
        "ru": "Распознавание речи активно"
    },
    "Volume": {
        "en": "Speech volume",
        "de": "Sprachlautstärke",
        "ru": "Громкость речи"
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
    },
    "Text 2 speech":     {"en": "Text 2 speech",     "de": "Text 2 speech",     "ru": "Синтез речи"},
    "Default room":      {"en": "Default room",      "de": "Default Raum",      "ru": "Комната по умолчанию"},
    "Response over TTS": {"en": "Response over TTS", "de": "Antworten mit TTS", "ru": "Отвечать голосом"},
    "Message":           {"en": "Message",           "de": "Meldung",           "ru": "Сообщение"},
    "Discard changes?":  {"en": "Discard changes?",  "de": "Die Änderungen sind nicht gespeichert. Ignorieren?",  "ru": "Игнорировать изменения?"}
});

var app = {
    settings: {
        socketUrl:      'http://localhost:8082',
        systemLang:     navigator.language || navigator.userLanguage || 'en',
        noSleep:        false,
        project:        '',
        resync:         false,
        instance:       null,
        allowMove:      false,
        recognition:    false,
        text2command:    0,
        defaultRoom:    '',
        volume:         80,
        noCommInBackground: false,
        responseWithTts: true
    },
    inBackground: false,
    connection:   '',
    projects:     [],
    ssid:         null,
    localDir:     null,
    directory:    cordova.file.externalDataDirectory,
    speaking:     false,
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
    onBackButton:   function () {
        $('#cordova_cancel').trigger('click');
    },
    bindEvents:     function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('pause', this.onDevicePause.bind(this), false);
        document.addEventListener('resume', this.onDeviceResume.bind(this), false);
        document.addEventListener('menubutton', function () {
            $('#cordova_menu').trigger('click');
        }, false);
    },
    receivedEvent:  function (event) {
        console.log('Received Event: ' + event);
    },
    onDevicePause:  function () {
        this.inBackground = true;
        if (this.settings.noCommInBackground) {
            vis.conn._socket.close();
        }
    },
    onDeviceResume: function () {
        this.inBackground = false;
        if (this.settings.noCommInBackground) {
            window.location.reload();
        }
    },
    getLocalDir:    function (dir, create, cb, index) {
        if (typeof create === 'function') {
            index  = cb;
            cb     = create;
            create = true;
        }

        if (!this.directory) this.directory = cordova.file.externalDataDirectory;

        if (!this.localDir) {
            window.resolveLocalFileSystemURL(this.directory, function (dirHandler) {
                this.localDir = dirHandler;
                this.getLocalDir(dir, create, cb);
            }.bind(this));
            return;
        }

        if (create) {
            index = index || 0;
            var parts = dir.split('/');

            this.localDir.getDirectory(parts[index], {
                create:    true,
                exclusive: false
            }, function (dirHandler) {
                if (parts.length - 1 == index) {
                    cb(null, dirHandler);
                } else {
                    this.getLocalDir(dir, create, cb, index + 1);
                }
            }.bind(this), function (error) {
                cb(error);
            });
        } else {
            this.localDir.getDirectory(dir, {
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
                    console.log('Store :' + fileN);
                    var length = data.byteLength || data.length || 0;
                    fileHandler.createWriter(function (fileWriter) {
                        try {
                            fileWriter.truncate(0);
                            fileWriter.onwrite = function(evt) {
                                if (length && evt.target.position !== length) return;
                                console.log('write "' + fileN + '" success:' + JSON.stringify(evt));
                                cb && cb();
                                cb = null;
                            };

                            fileWriter.write(new Blob([data]));
                        } catch (e) {
                            console.error(fileWriter.nativeURL + ': ' + e);
                            cb && cb(e);
                            cb = null;
                        }
                    }, function (error) {
                        cb && cb(error);
                        cb = null;
                        console.error('Cannot write file: ' + JSON.stringify(error));
                    });
                }, function (error) {
                    cb && cb(error);
                    cb = null;
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
                        console.error('Cannot read file "' + fileName + '": ' + JSON.stringify(error));
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

    onDeviceReady:  function () {
        this.receivedEvent('deviceready');
        this.settings.socketUrl = this.settings.socketUrl.toLowerCase();

        if (!this.settings.socketUrl.match(/^http:\/\/|^https:\/\//i)) {
            this.settings.socketUrl = 'http://' + this.settings.socketUrl;
        }


        /*this.writeLocalFile('main/imgavSony.png', 'text', function (error) {
            this.readLocalFile('main/imgavSony.png', function (error, result) {
                if (error) console.error(error);
                if (!result || this.settings.resync) {

                }
            }.bind(this));
        }.bind(this));*/

        this.connection = navigator.network ? navigator.network.connection.type : undefined;
        document.addEventListener('online', function () {
            if (navigator.network && navigator.network.connection.type !== this.connection) {
                window.location.reload();
            }
        }.bind(this), false);

        this.loadSettings(function () {
            if (window.plugins.insomnia) {
                if (this.settings.noSleep) {
                    window.plugins.insomnia.keepAwake();
                } else {
                    window.plugins.insomnia.allowSleepAgain();
                }
            }

            this.installMenu();
            // because of different translation
            this.yes = _('yes');
            this.no  = _('no');
            this.loadCss();

            if (this.settings.project) {
                this.readLocalFile(this.settings.project + '/vis-views.json', function (error, result) {
                    if (error) console.error(error);
                    if (!result || this.settings.resync) {
                        this.syncVis(this.settings.project, function () {
                            this.settings.resync = false;
                            this.saveSettings();
                            if (!this.viewExists) {
                                window.alert(_('No views found in %s', this.settings.project));
                            } else {
                                window.location.reload();
                            }
                        }.bind(this));
                    }
                }.bind(this));
            }

            if (!this.settings.project || this.settings.socketUrl == 'http://localhost:8084') {
                $('#cordova_menu').trigger('click');
            }

            if (!this.settings.allowMove) {
                $('#vis_container').css({
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
                });
            }
            $('.vis-wait-text').css({left: 0, 'padding-left': '1em'});

            this.initSpeechRecognition();
            this.manageDisplayRotation();

            // init vis
            main(jQuery);
        }.bind(this));
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
                        this.ssid = data.connection.SSID;
                        if (this.settings.socketUrlGSM && this.settings.ssid && data.connection.SSID != this.settings.ssid) {
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
            this.projects = [];
            $('#cordova_project').html('');
            vis.conn.readDir('/vis.0', function (error, files) {
                var count = 0;
                for (var f = 0; f < files.length; f++) {
                    if (files[f].isDir) {
                        count++;
                        this.readProjectsHelper(files[f].file, function (project) {
                            if (project) {
                                this.projects.push(project);
                                $('#cordova_project').append('<option value="' + project + '" ' + (project == this.settings.project ? 'selected' : '') + '>' + project + '</option>');
                            }
                        }.bind(this));
                    }
                }
                if (!--count && cb) cb();
            }.bind(this));
        } else {
            setTimeout(function () {
                this.readProjects(cb);
            }.bind(this), 500);
        }
    },

    copyFilesToDevice: function (files, cb, total) {
        if (total === undefined) total = files;

        if (!files || !files.length) {
            if (cb) setTimeout(cb, 0);
            return;
        }
        var file = files.pop();

        vis.conn.readFile64(file, function (error, data, filename) {
            if (error) console.error(error);
            $('#cordova_progress_show').css('width', (100 - (files.length / total.length) * 100) + '%');

            if (!error && data !== undefined && data !== null) {
                if (data.mime.indexOf('text') === -1 && data.mime.indexOf('application') === -1) {
                    var binary_string =  window.atob(data.data);
                    var len = binary_string.length;
                    var bytes = new Uint8Array( len );
                    for (var i = 0; i < len; i++)        {
                        bytes[i] = binary_string.charCodeAt(i);
                    }

                    data = bytes.buffer;
                } else {
                    data = window.atob(data.data || '');
                }

                // modify vis-views.json
                if (filename && filename.indexOf('vis-views.json') != -1) {
                    this.viewExists = true;
                    data = data.toString();
                    // detect: /vis/, /vis.0/, /icon-blabla/, ...
                    var m = data.match(/": "\/[-_0-9\w]+(\.[-_0-9\w]+)?\/.+\.(png|jpg|jpeg|gif|wav|mp3|bmp)+"/g);
                    if (m) {
                        for (var mm = 0; mm < m.length; mm++) {
                            //file:///data/data/net.iobroker.vis/files/main/vis-user.css
                            //cdvfile://localhost/persistent
                            var fn = m[mm].substring(5); // remove ": "/
                            var originalFileName = fn.replace(/"/g, ''); // remove last "
                            var p  = fn.split('/');
                            var adapter = p.shift(); // remove vis.0 or whatever
                            fn  = p.shift(); // keep only one subdirectory
                            fn += p.length ? '/' + p.join('') : '';// all other subdirectories combine in one name because of store bug

                            if (adapter === 'vis') {
                                data = data.replace(m[mm], '": "' + m[mm].substring(9)); // remove ": "/vis/
                            } else {
                                // add to files
                                if (total.indexOf(('/' + originalFileName).replace('/vis.0/', '')) == -1) { // if "vis.0/dir/otherProject.png"
                                    files.push('/' + originalFileName);
                                }
                                // files cannot be stored directly in root
                                if (adapter == 'vis.0' && fn.indexOf('/') !== -1) {
                                    adapter = ''
                                } else {
                                    adapter = adapter + '/';
                                }
                                data = data.replace(m[mm], '": "' + this.directory + adapter + fn);
                            }
                        }
                    }
                }

                // remove sub-dirs
                var p = filename.replace(/^\/[-_0-9\w]+(\.[-_0-9\w]+)?\//, '').split('/');
                filename = p.shift();
                filename += p.length ? '/' + p.join('') : '';
                if (!p.length) {
                    p = file.split('/');
                    filename = (p[0] || p[1]) + '/' + filename;
                }

                console.log('writeLocalFile "' + file + '" as "' + filename + '"');
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

        if (!this.ttsText) {
            $('body').append('<div id="cordova_tts_text" style="border-radius: 1em; padding: 0.2em;position: absolute; z-index: 5000; background: lightgreen; top: 3em; left: 3em; font-size: 1.5em"></div>');
            this.ttsText = $('#cordova_tts_text');
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
                    locale: this.settings.systemLang,
                    volume: this.settings.volume
                };
            }
        }
        data.volume = parseInt(data.volume || 100, 10) || 100;

        if (data.language) data.locale = data.language;
        if (data.lang)     data.locale = data.lang;

        if (data.locale == 'en') data.locale = 'en-GB';
        if (data.locale == 'de') data.locale = 'de-DE';
        if (data.locale == 'ru') data.locale = 'ru-RU';

        if (this.settings.project && this.settings.recognition) {
            this.menu.css('background', 'rgba(0, 0, 0, 0.1)');
            this.recognition.stop();
        }

        if (this.ttsTextTimer) clearTimeout(this.ttsTextTimer);

        this.ttsText.html(data.text).show();

        this.ttsTextTimer = setTimeout(function () {
            this.ttsText.hide();
            this.ttsTextTimer = null;
        }.bind(this), 3000);

        if (window && window.system && window.system.setSystemVolume) {
            window.system.setSystemVolume(data.volume / 100);
        }

        if (typeof TTS !== 'undefined') {
            var d = new Date();
            console.log('[' + d.getSeconds() + '.' + d.getMilliseconds() + '] Start speaking: ' + JSON.stringify(data));
            this.speaking = true;
            TTS.speak(data, function () {
                var d = new Date();
                console.log('[' + d.getSeconds() + '.' + d.getMilliseconds() + '] Stop speaking: ' + JSON.stringify(data));

                this.speaking = false;
                if (this.settings.project && this.settings.recognition) {
                    this.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                    this.recognition.start();
                }
                cb && cb();
            }.bind(this), function (reason) {
                console.error(reason);
            });
        }
    },

    initSpeechRecognition: function () {
        if (this.settings.project && this.settings.recognition && (this.settings.text2command || this.settings.text2command === 0)) {
            $('body').append('<div id="cordova_show_recognized" style="display:none; padding: 0.2em; border-radius: 0.4em;position: absolute; z-index: 5000; background: lightskyblue; top: 1em; left: 3em; font-size: 1.5em;"></div>');
            this.recText = $('#cordova_show_recognized');

            this.recognition = new SpeechRecognition();
            this.recognition.maxAlternatives = 3;
            this.recognition.continuous      = true;
            this.recognition.interimResults  = true;
            this.recognition.lang            = this.settings.systemLang;
            if (this.settings.keyword) {
                this.settings.keyword = this.settings.keyword.trim();
                this.settings.keyword = this.settings.keyword.replace(/\s\s/g, ' ');
                this.match = [
                    new RegExp('\\s' + this.settings.keyword + '\\s', 'i'),
                    new RegExp('^'   + this.settings.keyword + '\\s', 'i'),
                    new RegExp('\\s' + this.settings.keyword + '$',   'i'),
                    new RegExp('^'   + this.settings.keyword + '$',   'i')
                ];
            }
            this.recognition.onresult = function(event) {
                var matched = false;
                if (event.results.length > 0) {
                    var text = event.results[0][0].transcript;
                    if (event.results[0][0].final) {
                        // start analyse
                        if (this.match) {
                            for (var m = 0; m < this.match.length; m++) {
                                if (this.match[m].test(text)) {
                                    text = text.replace(this.match[m], '').replace(/\s\s/g, ' ').trim();
                                    // Key phrase found
                                    matched = true;
                                    break;
                                }
                            }
                        } else {
                            matched = true;
                        }
                        if (matched) {
                            this.recText.css('background: lightblue');
                            this.recText.html(text).show();
                            if (this.settings.defaultRoom) {
                                text = text + ' [' + this.settings.defaultRoom + ']';
                                if (!this.defaultRoomRegExp) this.defaultRoomRegExp = new RegExp('\\s\\[' + this.settings.defaultRoom + '\\]', 'i');
                            }
                            // restart recognition if text2command inactive
                            var timeout = setTimeout(function () {
                                if (!this.settings.noCommInBackground || !this.inBackground) {
                                    this.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                                    if (!this.speaking) this.recognition.start(false);
                                }
                            }.bind(this), 1000);

                            vis.conn._socket.emit('sendTo', 'text2command.' + this.settings.text2command, 'send', text, function (response) {
                                // stop timeout if no text2command
                                if (timeout) {
                                    clearTimeout(timeout);
                                    timeout = null;
                                }
                                response.response = response.response || '';
                                if (this.settings.defaultRoom) {
                                    response.response = response.response.replace(this.defaultRoomRegExp, '');
                                }

                                if (this.settings.responseWithTts) {
                                    // say answer
                                    this.tts(response.response, function () {
                                        // Start recognition
                                        setTimeout(function () {
                                            if (!this.settings.noCommInBackground || !this.inBackground) {
                                                this.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                                                if (!this.speaking) this.recognition.start(false);
                                            }
                                        }.bind(this), 500);
                                    }.bind(this));
                                } else {
                                    setTimeout(function () {
                                        if (!this.settings.noCommInBackground || !this.inBackground) {
                                            this.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                                            if (!this.speaking) this.recognition.start(false);
                                        }
                                    }.bind(this), 200);
                                }
                            }.bind(this));
                        }
                    } else {
                        if (this.match) {
                            for (var m = 0; m < this.match.length; m++) {
                                if (this.match[m].test(text)) {
                                    text = text.replace(this.match[m], '').replace(/\s\s/g, ' ').trim();
                                    // Key phrase found
                                    matched = true;
                                    break;
                                }
                            }
                        }
                        if (!this.match || matched) {
                            this.recText.html(text).show();
                            this.recText.css('background: darkblue');
                        }
                    }

                    if (this.recTextTimeout) clearTimeout(this.recTextTimeout);

                    this.recTextTimeout = setTimeout(function () {
                        this.recTextTimeout = null;
                        this.recText.hide();
                    }.bind(this), 2000);
                }

                if (!matched) {
                    if (!this.settings.noCommInBackground || !this.inBackground) {
                        setTimeout(function () {
                            this.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                            if (!this.speaking) this.recognition.start(false);
                        }.bind(this), 100);
                    }
                }
            }.bind(this);

            this.recognition.onend = function(event) {
                this.menu.css('background', 'rgba(0, 0, 0, 0.1)');
            }.bind(this);

            this.recognition.onerror = function(event) {
                var d = new Date();
                console.log('[' + d.getSeconds() + '.' + d.getMilliseconds() + '] Error by recognizing: ' + JSON.stringify(event));
                this.menu.css('background', 'rgba(0, 0, 0, 0.1)');
                if (!this.settings.noCommInBackground || !this.inBackground) {
                    setTimeout(function () {
                        this.menu.css('background', 'rgba(0, 0, 128, 0.5)');
                        if (!this.speaking) this.recognition.start(true);
                    }.bind(this), 300);
                }
            }.bind(this);

            this.recognition.ondebug = function (event) {
                console.log(JSON.stringify(event));
            };

            this.menu = $('#cordova_menu');
            this.menu.css('background', 'rgba(0, 0, 128, 0.5)');
            if (!this.speaking) this.recognition.start(false);
        }
    },

    manageDisplayRotation: function () {
        // Manage rotation
        this.window = {
            orientation: window.orientation,
            width:       window.innerWidth,
            height:      window.innerHeight
        };

        window.onorientationchange = function () {
            var viewport_scale;

            if (window.orientation == 0 || window.orientation == 180) {
                if (this.window.orientation == 0 || this.window.orientation == 180) {
                    // landscape
                    viewport_scale = 1;
                } else {
                    // portrait
                    viewport_scale = this.window.width / this.window.height;
                }
            } else if (window.orientation == 90 || window.orientation == -90) {
                if (this.window.orientation == 90 || this.window.orientation == -90) {
                    // landscape
                    viewport_scale = 1;
                } else {
                    // portrait
                    viewport_scale = this.window.width / this.window.height;
                }
            }

            // resize viewport
            $('meta[name=viewport]').attr('content',
                'width=' + this.window.width + ',' +
                'minimum-scale=' + viewport_scale + ', maximum-scale=' + viewport_scale);
        }.bind(this);
        // resize viewport
        $('meta[name=viewport]').attr('content',
            'width=' + this.window.width + ',' +
            'minimum-scale=1, maximum-scale=1');
    },

    loadCss:        function () {
        if (this.settings.project) {
            this.readLocalFile(this.settings.project + '/vis-user.css', function (error, data) {
                if (data) {
                    $('head').append('<style id="vis-user" class="vis-user">' + data + '</style>');
                }
                $(document).trigger('vis-user');
            });
        }

    },

    installMenu:    function () {
        // install menu button
        $('body').append('<div id="cordova_menu" style="top: 0.5em; left: 0.5em; padding-left: 0.5em; padding-right: 0.5em; position: fixed; background: rgba(0,0,0,0.1); border-radius: 20px; z-index: 15002" id="cordova_menu">...</div>');
        $('body').append('<div id="cordova_dialog_bg" style="display: none"></div>' +
            '<div id="cordova_dialog">' +
            '<div style="padding-left: 1em; font-size: 2em; font-weight: bold">' + _('Settings') +
            '<span style="padding-left: 1em; font-size: 0.5em" id="cordova_version"></span>' + '</div>' +
            '<table style="width: 100%; padding: 1em">' +

            '<tr><td colspan="2"><div class="button-group">'            +
            '<div class="left">' +
            '<button id="cordova_reload">&#8634;' + _('Reload')  + '</button>' +
            '<button id="cordova_resync">⇔' + _('Re-sync') + '</button>' +
            '</div><div class="right">' +
            '<button id="cordova_ok">✔'     + _('Ok')      + '</button>' +
            '<button id="cordova_cancel">&#10060;' + _('Cancel')  + '</button>' +
            '</div></div></td></tr>'  +

            '<tr><td class="cordova-settings-label">' + _('Connected') + ':</td></td><tr>' +
            '<tr><td class="cordova-settings-value"><div id="cordova_connected"></div></td></tr>' +

            '<tr><td class="cordova-settings-label">' + _('Language')  + ':</td></tr>' +
            '<tr><td class="cordova-settings-value"><select data-name="systemLang" class="cordova-setting">' +
            '<option value="">' + _('System') + '</option>' +
            '<option value="en">english</option>' +
            '<option value="de">deutsch</option>' +
            '<option value="ru">русский</option>' +
            '</select></td></tr>' +

            '<tr><td class="cordova-settings-label">' + _('Project')               + ':</td></tr>' +
            '<tr><td class="cordova-settings-value"><select class="cordova-setting" data-name="project"     id="cordova_project" style="width: 100%"></select></td></tr>' +

            '<tr><td class="cordova-settings-label"><label for="noSleep">' + _('Prevent from sleep')       + ':</label></td></tr>' +
            '<tr><td><input id="noSleep" class="cordova-setting" data-name="noSleep" type="checkbox"/><label for="noSleep" class="checkbox">&#8226;</label></td></tr>'+

            '<tr><td class="cordova-settings-label"><label for="allowMove">' + _('Allow window move')      + ':</label></td></tr>' +
            '<tr><td><input  id="allowMove"      class="cordova-setting" data-name="allowMove"   type="checkbox"/><label for="allowMove" class="checkbox">&#8226;</label></td></tr>'+

            '<tr><td class="cordova-settings-label">' + _('Instance')              + ':</td></tr>' +
            '<tr><td><input  class="cordova-setting" data-name="instance"    style="width: 100%"/></td></tr>' +

            '<tr><td class="cordova-settings-label"><label for="noCommInBackground">' + _('Sleep in background')   + ':</label></td></tr>' +
            '<tr><td><input  id="noCommInBackground" class="cordova-setting" data-name="noCommInBackground" type="checkbox"/><label for="noCommInBackground" class="checkbox">&#8226;</label></td></tr>'+

            '<tr><td class="cordova-settings-label section-legend"><span>'      + _('Speech recognition') + '</span><div class="cordova_toggle" data-group="speech">▶</div></td></tr>'+
            '<tr class="cordova-setting-speech"><td class="cordova-settings-label"><label for="recognition">' + _('Speech recognition active') + ':</label></td></tr>' +
            '<tr class="cordova-setting-speech"><td><input  id="recognition" class="cordova-setting" data-name="recognition" type="checkbox"/><label for="recognition" class="checkbox">&#8226;</label></td></tr>'+

            '<tr class="cordova-setting-speech cordova-settings-label speech"><td>' + _('Keyword')       + ':</td></tr>' +
            '<tr class="cordova-setting-speech speech"><td><input  class="cordova-setting" data-name="keyword"     style="width: 100%"/></td></tr>' +

            '<tr class="cordova-setting-speech cordova-settings-label speech"><td>' + _('Text 2 speech') + ':</td></tr>' +
            '<tr class="cordova-setting-speech speech"><td><select id="text2command" class="cordova-setting" data-name="text2command" style="width: 100%"></select></td></tr>' +

            '<tr class="cordova-setting-speech cordova-settings-label speech"><td>' + _('Volume') + ':</td></tr>' +
            '<tr class="cordova-setting-speech speech"><td><input type="range" min="0" max="100" class="cordova-setting" data-name="volume" style="width: 100%"/></td></tr>' +

            '<tr class="cordova-setting-speech cordova-settings-label speech"><td>' + _('Default room') + ':</td></tr>' +
            '<tr class="cordova-setting-speech speech"><td><select id="defaultRoom" class="cordova-setting" data-name="defaultRoom" style="width: 100%"></select></td></tr>' +

            '<tr class="cordova-setting-speech cordova-settings-label speech"><td><label for="responseWithTts">' + _('Response over TTS') + ':</label></td></tr>' +
            '<tr class="cordova-setting-speech speech"><td><input id="responseWithTts"    class="cordova-setting" data-name="responseWithTts" type="checkbox"/><label for="responseWithTts" class="checkbox">&#8226;</label></td></tr>' +

            '<tr><td class="cordova-settings-label section-legend"><span>'      + _('WIFI') + '</span><div class="cordova_toggle" data-group="ssid">▶</div></td></tr>'+
            '<tr class="cordova-setting-ssid"><td>' + _('WIFI SSID') + ':</td></tr>' +
            '<tr class="cordova-setting-ssid"><td><input class="cordova-setting" data-name="ssid"       style="width: calc(100% - 4em)" id="cordova_ssid"/><button id="cordova_ssid_button" style="width: 3em; height: 2.3em;">' + _('Actual') + '</button></td></tr>'+

            '<tr class="cordova-setting-ssid"><td class="cordova-settings-label">' + _('WIFI Socket')           + ':</td></tr>' +
            '<tr class="cordova-setting-ssid"><td><input class="cordova-setting" data-name="socketUrl"  style="width: 100%"/></td></tr>'+

            '<tr class="cordova-setting-ssid"><td  class="cordova-settings-label">' + _('WIFI User')             + ':</td></tr>' +
            '<tr class="cordova-setting-ssid"><td><input class="cordova-setting" data-name="user"       style="width: 100%"/></td></tr>'+

            '<tr class="cordova-setting-ssid"><td class="cordova-settings-label">' + _('WIFI Password')         + ':</td></tr>' +
            '<tr class="cordova-setting-ssid"><td><input class="cordova-setting" data-name="password"   type="password" id="cordova-password" style="width: 100%"/></td></tr>'+

            '<tr class="cordova-setting-ssid"><td class="cordova-settings-label">' + _('WIFI Password repeat')  + ':</td></tr>' +
            '<tr class="cordova-setting-ssid"><td><input id="cordova-password-repeat" type="password"   style="width: 100%"/></td></tr>'+

            '<tr><td class="cordova-settings-label section-legend"><span>' + _('Cell')      + '</span><div class="cordova_toggle" data-group="cell">▶</div></td></tr>'+
            '<tr class="cordova-setting-cell"><td>' + _('Cell Socket')           + ':</td></tr>' +
            '<tr class="cordova-setting-cell"><td><input  class="cordova-setting" data-name="socketUrlGSM" style="width: 100%"/></td></tr>'+

            '<tr class="cordova-setting-cell"><td class="cordova-settings-label">' + _('Cell User')             + ':</td></tr>' +
            '<tr class="cordova-setting-cell"><td><input class="cordova-setting" data-name="userGSM"    style="width: 100%"/></td></tr>'+

            '<tr class="cordova-setting-cell"><td class="cordova-settings-label">' + _('Cell Password')         + ':</td></tr>' +
            '<tr class="cordova-setting-cell"><td><input class="cordova-setting" data-name="passwordGSM" type="password" id="cordova-password-gsm" style="width: 100%"/></td></tr>'+

            '<tr class="cordova-setting-cell"><td class="cordova-settings-label">' + _('Cell Password repeat')  + ':</td></tr>' +
            '<tr class="cordova-setting-cell"><td><input id="cordova-password-repeat-gsm" type="password" style="width: 100%"/></td></tr>'+

            '</select></td></tr>'+
            '</table></div>');

        cordova.getAppVersion.getVersionNumber().then(function (version) {
            $('#cordova_version').text(version);
        });

        // todo read text2command instances
        // todo read rooms

        var that = this;
        $('#cordova_menu').click(function () {
            document.addEventListener('backbutton', that.onBackButton, false);
            // load settings
            $('#cordova_dialog .cordova-setting').each(function() {
                if ($(this).attr('type') === 'checkbox') {
                    $(this).prop('checked', that.settings[$(this).data('name')]);
                    if ($(this).data('name') === 'recognition' && !that.settings.recognition) {
                        $('.speech').hide();
                    }
                } else {
                    $(this).val(that.settings[$(this).data('name')]);
                }
            });

            // todo read text2command instances
            if (typeof vis !== 'undefined' && vis.conn) {
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

            if (that.ssid) {
                $('#cordova_ssid_button').show();
                $('#cordova_ssid').css('width', 'calc(100% - 4em)');
            } else {
                $('#cordova_ssid_button').hide();
                $('#cordova_ssid').css('width', '100%');
            }

            $('.cordova_toggle').unbind('click').click(function () {
                if ($(this).html() == '▶') {
                    $('.cordova-setting-' + $(this).data('group')).show();
                    $(this).html('▼');
                } else {
                    $('.cordova-setting-' + $(this).data('group')).hide();
                    $(this).html('▶');
                }
            });

            $('.cordova-setting-ssid').hide();
            $('.cordova-setting-cell').hide();
            $('.cordova-setting-speech').hide();

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
                $('#cordova_ssid').val(that.ssid);
            });

            $('#cordova_cancel').unbind('click').click(function () {
                document.removeEventListener('backbutton', that.onBackButton, false);
                $('#cordova_dialog_bg').hide();
                $('#cordova_dialog').hide();
            }).css({height: '2em'});

            $('#cordova_reload').unbind('click').click(function () {
                document.removeEventListener('backbutton', that.onBackButton, false);
                var changed = false;
                // save settings
                $('#cordova_dialog .cordova-setting').each(function() {
                    if ($(this).attr('type') === 'checkbox') {
                        if (that.settings[$(this).data('name')] != $(this).prop('checked')) {
                            changed = true;
                            return false;
                        }
                    } else {
                        if (that.settings[$(this).data('name')] != $(this).val()) {
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
                document.removeEventListener('backbutton', that.onBackButton, false);
                var changed = false;

                // save settings
                $('#cordova_dialog .cordova-setting').each(function() {
                    if ($(this).attr('type') === 'checkbox') {
                        if (that.settings[$(this).data('name')] != $(this).prop('checked')) {
                            changed = true;
                            return false;
                        }
                    } else {
                        if (that.settings[$(this).data('name')] != $(this).val()) {
                            changed = true;
                            return false;
                        }
                    }
                });

                //if (changed && !window.confirm(_('Discard changes?'))) return;

                that.settings.resync = true;
                /*$('#cordova_dialog_bg').hide();
                $('#cordova_dialog').hide();
                that.saveSettings();
                window.location.reload();*/
                $('#cordova_ok').trigger('click');
            }).css({height: '2em'});

            $('#cordova_ok').unbind('click').click(function () {
                document.removeEventListener('backbutton', that.onBackButton, false);
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
                        if (that.settings[$(this).data('name')] != $(this).prop('checked')) {
                            that.settings[$(this).data('name')] = $(this).prop('checked');
                            changed = true;
                        }
                    } else {
                        if (that.settings[$(this).data('name')] != $(this).val()) {
                            that.settings[$(this).data('name')] = $(this).val();
                            changed = true;
                            if ($(this).data('name') === 'project') projectChanged = true;
                        }
                    }
                });

                if (changed || that.settings.resync) {
                    // If project name changed
                    if ((projectChanged || that.settings.resync) && vis.conn.getIsConnected()) {
                        // try to load all files
                        that.syncVis(that.settings.project, function () {
                            that.settings.resync = false;
                            that.saveSettings();
                            if (!that.viewExists) {
                                window.alert(_('No views found in %s', that.settings.project));
                            } else {
                                window.location.reload();
                            }
                        });
                    } else {
                        that.saveSettings();
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
            $('#cordova_connected').html('<span style="color: green">' + this.yes +'</span>');
            if (!this.projects.length) this.readProjects();
            if (this._connectInterval) {
                clearInterval(this._connectInterval);
                this._connectInterval = null;
            }
            if (this._countInterval) {
                clearInterval(this._countInterval);
                this._countInterval = null;
            }
        } else {
            $('#cordova_connected').html('<span style="color: red">'   + this.no +'</span>');

            if (this._connectInterval) {
                clearInterval(this._connectInterval);
                this._connectInterval = null;
            }
            if (this._countInterval) {
                clearInterval(this._countInterval);
                this._countInterval = null;
            }

            // force reconnection
            if (!this.settings.noCommInBackground || !this.inBackground) {
                // reconnect
                this._connectInterval = setInterval(function () {
                    console.log('Trying connect...');
                    vis.conn._socket.connect();
                    this._countDown = 10;
                    $('.splash-screen-text').html(this._countDown + '...').css('color', 'red');
                }.bind(this), 10000);

                this._countDown = 10;
                $('.splash-screen-text').html(this._countDown + '...');

                this._countInterval = setInterval(function () {
                    this._countDown--;
                    $('.splash-screen-text').html(this._countDown + '...');
                }.bind(this), 1000);
            }
        }
    }
};

app.initialize();