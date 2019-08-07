import {Config} from "protractor";
import {getChromeCapabilities, getFirefoxCapabilities} from "./capabilities";
import {promise} from "protractor"
import {PrimoStudioReporter} from "./primoStudioReporter";
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var htmlReporter = new HtmlScreenshotReporter({
    dest: 'target/screenshots',
    showQuickLinks: true,
    userCss: '../../report.css',
    captureOnlyFailedSpecs: true,
    reportOnlyFailedSpecs: false
});

var primoStudioReporter = new PrimoStudioReporter({});

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
    getMultiCapabilities: () => {
        let chromeCapabilities = getChromeCapabilities();
        let firefoxCapabilities = getFirefoxCapabilities();

        return promise.all([chromeCapabilities]);
    },
    noGlobals: false,
    allScriptsTimeout: 120000,
    getPageTimeout: 120000,
    jasmineNodeOpts: {
        stopSpecOnExpectationFailure: false,
        defaultTimeoutInterval: 90000
    },
    //runs once before the tests
    beforeLaunch: () => {
        return new Promise((resolve) => {
            primoStudioReporter.beforeLaunch(() => {
                htmlReporter.beforeLaunch(resolve);
            });
        });
    },

    // Assign the test reporter to each running instance, runs for every capabillity
    onPrepare: () => {
        let globals = require('protractor');
        let browser = globals.browser;
        jasmine.getEnv().addReporter(htmlReporter);
        jasmine.getEnv().addReporter(primoStudioReporter);
    },

    // Close the report after all tests finish
    afterLaunch: (exitCode) => {
        return new Promise<any>((resolve) => {
            primoStudioReporter.afterLaunch(() => {
                htmlReporter.afterLaunch(resolve.bind(this, exitCode));
            });
        });
    },
    suites: {
        search: ['tests/search/*.spec.js'],
        favorites: ['tests/favorites/*.spec.js']
    }
};