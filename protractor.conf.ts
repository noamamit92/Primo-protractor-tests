import {Config} from "protractor";
import {getChromeCapabilities, getFirefoxCapabilities} from "./capabilities";
import {promise} from "protractor"
import AppConfigUtil from "./utils/appconfig-util";
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var reporter = new HtmlScreenshotReporter({
    dest: 'target/screenshots',
    showQuickLinks: true,
    userCss: '../../report.css',
    captureOnlyFailedSpecs: true,
    reportOnlyFailedSpecs: false
});

var directConnect = process.platform !== 'win32' && !(process.env.HOSTTYPE && process.env.HOSTTYPE === 'x86_64');

export const config: Config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        baseUrl: 'https://primo-demo.hosted.exlibrisgroup.com',
        vid: 'NORTH',
        isVe: false
    },
    specs: ['tests/*/*.spec.js'],
    framework: "jasmine",
    resultJsonOutputFile: 'target/results.json',
    directConnect: directConnect,
    getMultiCapabilities: () => {
        let chromeCapabilities = getChromeCapabilities();
        let firefoxCapabilities = getFirefoxCapabilities();

        return promise.all([chromeCapabilities, firefoxCapabilities]);
    },
    noGlobals: false,
    allScriptsTimeout: 120000,
    getPageTimeout: 120000,
    jasmineNodeOpts: {
        stopSpecOnExpectationFailure: false
    },
    //runs once before the tests
    beforeLaunch: () => {
        return new Promise((resolve) => {
            reporter.beforeLaunch(resolve);
        });
    },

    // Assign the test reporter to each running instance
    onPrepare: () => {
        let globals = require('protractor');
        let browser = globals.browser;
        jasmine.getEnv().addReporter(reporter);
        AppConfigUtil.setEnviormentVars();
    },

    // Close the report after all tests finish
    afterLaunch: (exitCode) => {
        return new Promise<any>((resolve) => {
            reporter.afterLaunch(resolve.bind(this, exitCode));
        });
    },
    suites: {
        search: ['tests/search/*.spec.js'],
        favorites: ['tests/favorites/*.spec.js']
    }
};