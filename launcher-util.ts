import * as Launcher from 'protractor/built/launcher'




process.on('message', function (conf) {
    console.log('in child process: ' + conf.baseUrl);
    Launcher.init('tmp/protractor.conf.js', {params: conf});

 })

process.send('ready');