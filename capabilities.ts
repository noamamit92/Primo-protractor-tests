import {Profile} from "selenium-webdriver/firefox";
import {promise} from "selenium-webdriver";

let q = require("q");

export function getChromeCapabilities(): promise.Promise<any> {
    let deferred = q.defer();

    deferred.resolve({
        browserName: 'chrome',
        chromeOptions: {
            args: ['--no-sandbox']
        },
        shardTestFiles: true,
        maxInstances: 10
    });

    return deferred.promise;
}

export function getFirefoxCapabilities(): promise.Promise<any> {
    let deferred = q.defer();

    let profile: Profile = new Profile();
    profile.setAcceptUntrustedCerts(true);
    profile.setAssumeUntrustedCertIssuer(false);
    profile.setPreference("browser.tabs.remote.autostart", false);
    profile.setPreference("browser.tabs.remote.autostart.1", false);
    profile.setPreference("browser.tabs.remote.autostart.2", false);

    profile.encode().then(encoded => {
        deferred.resolve({
            browserName: 'firefox',
            firefox_profile: encoded,
            'moz:firefoxOptions': {
                args: ['--safe-mode']
            },
            shardTestFiles: true,
            maxInstances: 10
        });

    });

    return deferred.promise;
}
