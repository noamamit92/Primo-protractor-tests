import {Config} from "protractor";
import {getChromeCapabilities, getFirefoxCapabilities} from "./capabilities";
import {promise} from "protractor"
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var htmlReporter = new HtmlScreenshotReporter({
    dest: 'target/screenshots',
    showQuickLinks: true,
    userCss: '../../report.css',
    captureOnlyFailedSpecs: true,
    reportOnlyFailedSpecs: false
});


export const config: Config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        envArray:['https://sqa-ap01.alma.exlibrisgroup.com']
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
        defaultTimeoutInterval: 120000
    },



    // Assign the test reporter to each running instance, runs for every capabillity
    onPrepare: () => {
        let globals = require('protractor');
        let browser = globals.browser;
        browser.manage().window().setSize(1600, 800);
        var jasmineReporters = require('jasmine-reporters');
        var timestamp = new Date().getTime().toString();
        var junitReporter = new jasmineReporters.JUnitXmlReporter({

            // setup the output path for the junit reports
            savePath: 'target/',

            // conslidate all true:
            //   output/junitresults.xml
            //
            // conslidate all set to false:
            //   output/junitresults-example1.xml
            //   output/junitresults-example2.xml
            consolidateAll: true,
            filePrefix:timestamp

        });
        jasmine.getEnv().addReporter(junitReporter);



    },

    // Close the report after all tests finish

    suites: {
        search: ['tests/search/*.spec.js'],
        favorites: ['tests/favorites/*.spec.js']
    }
};