import CustomReporter = jasmine.CustomReporter;
import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
let mkdirp = require("mkdirp");
import * as _ from "lodash";
import {browser} from "protractor";

export class PrimoStudioReporter implements CustomReporter{
    private jsonResultsObj: any;
    private opts: any;
    private runningSuite: any;
    private readonly suites: any;
    private readonly specs: any;
    private readonly fakeFocusedSuite: jasmine.CustomReporterResult;

    constructor(opts: any) {
        this.opts = _.assign({}, opts);
        this.opts.filename = opts.filename || "results.studio.json";
        this.opts.dest = opts.dest || "target";
        this.opts.browserCaps = {};
        this.opts.showConfiguration = opts.showConfiguration || true;
        this.opts.reportOnlyFailedSpecs = opts.hasOwnProperty('reportOnlyFailedSpecs') ? opts.reportOnlyFailedSpecs : true;

        this.runningSuite = null;
        this.suites = {};
        this.specs = {};

        // when use use fit, jasmine never calls suiteStarted / suiteDone, so make a fake one to use
        this.fakeFocusedSuite = {
            id: 'focused',
            description: 'focused specs',
            fullName: 'focused specs'
        };
    }

    beforeLaunch(callback: any) {

        this.cleanDestination((err) => {
            if (err) {
                throw err;
            }

            if (fs.existsSync(path.join(this.opts.dest, this.opts.filename))) {
                fs.unlink(
                    path.join(this.opts.dest, this.opts.filename),
                    (err) => {
                        if (err) {
                            console.error('Error writing to file: ' + path.join(this.opts.dest, this.opts.filename));
                            throw err;
                        }
                        callback();
                    }
                );
            } else {
                callback();
            }
        });
        this.jsonResultsObj = {};
    }

    jasmineStarted(suiteInfo: jasmine.SuiteInfo): void {
        browser.getCapabilities().then((capabilities) => {
            this.opts.browserCaps.browserName = capabilities.get('browserName');
            this.opts.browserCaps.browserVersion = capabilities.get('version');
            this.opts.browserCaps.platform = capabilities.get('platform');
            this.opts.browserCaps.javascriptEnabled = capabilities.get('javascriptEnabled');
            this.opts.browserCaps.cssSelectorsEnabled = capabilities.get('cssSelectorsEnabled');
        });
    }

    suiteStarted(result: jasmine.CustomReporterResult): void {
        let suite = this.getSuiteClone(result);
        suite._suites = [];
        suite._specs = [];
        suite._started = Date.now();
        suite._parent = this.runningSuite;

        if (this.runningSuite) {
            this.runningSuite._suites.push(suite);
        }

        this.runningSuite = suite;
    }

    specStarted(result: jasmine.CustomReporterResult): void {
        if (!this.runningSuite) {
            // focused spec (fit) -- suiteStarted was never called
            this.suiteStarted(this.fakeFocusedSuite);
        }
        let spec = this.getSpecClone(result);
        spec._started = Date.now();
        spec._suite = this.runningSuite;
        this.runningSuite._specs.push(spec);
    }

    specDone(result: jasmine.CustomReporterResult): void {
        let spec = this.getSpecClone(result);
        spec._finished = Date.now();

        if (!this.isSpecValid(spec)) {
            spec.skipPrinting = true;
            return;
        }

        _.each(browser.forkedInstances, (browserInstance, key) => {
            if (!browserInstance) {
                return;
            }

            if(this.opts.reportFailedUrl) {
                if(spec.status === 'failed') {
                    browserInstance.getCurrentUrl().then((url) => {
                        spec.failedAtUrl = url;
                    });
                }
            }
        });
    }

    suiteDone(result: jasmine.CustomReporterResult): void {
        let suite = this.getSuiteClone(result);
        if (suite._parent === undefined) {
            // disabled suite (xdescribe) -- suiteStarted was never called
            this.suiteStarted(suite);
        }
        suite._finished = Date.now();
        this.runningSuite = suite._parent;
    }

    jasmineDone(runDetails: jasmine.RunDetails): void {
        let output: any = {};

        if (this.runningSuite) {
            // focused spec (fit) -- suiteDone was never called
            this.suiteDone(this.fakeFocusedSuite);
        }

        _.each(this.suites, (suite) => {
            if (!output['suites']) {
                output['suites'] = [];
            }
            output['suites'].push(this.getResults(suite));
        });

        // Ideally this shouldn't happen, but some versions of jasmine will allow it
        _.each(this.specs, (spec) => {
            let specObj = this.getSpec(spec);
            if (specObj) {
                if (!output['specs']) {
                    output['specs'] = [];
                }
                output['specs'].push(specObj);
            }
        });

        // Add configuration information when specs have been reported.
        let suiteHasSpecs = false;

        _.each(this.specs, (spec) => {
            suiteHasSpecs = spec.isPrinted || suiteHasSpecs;
        });

        if (suiteHasSpecs) {
            output['configuration'] = this.printTestConfiguration();
        }

        if (!this.jsonResultsObj) {
            this.jsonResultsObj = {};
        }
        this.jsonResultsObj[output['configuration']['Browser name']] = output;
    }

    afterLaunch(callback: any) {
        fs.appendFile(
            path.join(this.opts.dest, this.opts.filename),
            JSON.stringify(this.jsonResultsObj),
            { encoding: 'utf8' },
            (err) => {
                if(err) {
                    console.error('Error writing to file:' + path.join(this.opts.dest, this.opts.filename));
                    throw err;
                }
                callback();
            }
        );
    }

    private cleanDestination(callback: (err?) => void) {
        // if we aren't removing the old report folder then simply return
        if (!this.opts.cleanDestination) {
            callback();
            return;
        }

        rimraf(this.opts.dest, (err) => {
            if(err) {
                throw new Error('Could not remove previous destination directory ' + this.opts.dest);
            }

            mkdirp(this.opts.dest, (err) => {
                if(err) {
                    throw new Error('Could not create directory ' + this.opts.dest);
                }

                callback(err);
            });
        });
    }

    private getSuiteClone(suite: any) {
        this.suites[suite.id] = _.extend((this.suites[suite.id] || {}), suite);
        return this.suites[suite.id];
    }

    private getSpecClone(spec: jasmine.CustomReporterResult) {
        this.specs[spec.id] = _.extend((this.specs[spec.id] || {}), spec);
        return this.specs[spec.id];
    }

    private isSpecValid(spec: any): boolean {
        // Don't screenshot skipped specs
        let isSkipped = this.opts.ignoreSkippedSpecs && (spec.status === 'pending' || spec.status === 'disabled');
        // Screenshot only for failed specs
        let isIgnored = this.opts.captureOnlyFailedSpecs && spec.status !== 'failed';

        return !isSkipped && !isIgnored;
    }

    private getResults(suite: any) {
        let output = {};

        if (suite.isPrinted || !this.hasValidSpecs(suite)) {
            return undefined;
        }

        suite.isPrinted = true;

        output['description'] = suite.description;
        output['duration'] = '(' + this.getDuration(suite) + ' s)';

        _.each(suite._specs, (spec) => {
            spec = this.specs[spec.id];
            if (!output['specs']) {
                output['specs'] = [];
            }
            output['specs'].push(this.getSpec(spec));
        });

        if (suite._suites.length) {
            _.each(suite._suites, (childSuite) => {
                if (!output['suites']) {
                    output['suites'] = [];
                }
                output['suites'].push(this.getResults(childSuite));
            });
        }

        return output;
    }

    private getSpec(spec: any) {
        let suiteName = spec._suite ? spec._suite.fullName : '';

        if (spec.isPrinted || (spec.skipPrinting && !this.isSpecReportable(spec))) {
            return undefined;
        }

        spec.isPrinted = true;

        return {
            browserName: this.opts.browserCaps.browserName,
            status: spec.status,
            duration: this.getDuration(spec),
            name:     spec.fullName.replace(suiteName, '').trim(),
            reason:   this.printReasonsForFailure(spec),
            failedUrl:  this.printFailedUrl(spec),
            specId:   spec.id
        };
    }

    private printTestConfiguration() {
        let testConfiguration = {
            // @ts-ignore
            'Jasmine version': jasmine.version,
            'Browser name': this.opts.browserCaps.browserName,
            'Browser version': this.opts.browserCaps.browserVersion,
            'Platform': this.opts.browserCaps.platform,
            'Javascript enabled': this.opts.browserCaps.javascriptEnabled,
            'Css selectors enabled': this.opts.browserCaps.cssSelectorsEnabled
        };

        testConfiguration = _.assign(testConfiguration, this.opts.configurationStrings);

        return testConfiguration;
    }

    private reportTemplate(param: { report: any }): string {

        return JSON.stringify(param.report);
    }

    private hasValidSpecs(suite: any): boolean {
        let validSuites = false;
        let validSpecs = false;

        if (suite._suites.length) {
            validSuites = _.some(suite._suites, (s) => {
                return this.hasValidSpecs(s);
            });
        }

        if (suite._specs.length) {
            validSpecs = _.some(suite._specs, (s) => {
                return this.isSpecValid(s) || this.isSpecReportable(s);
            });
        }

        return validSuites || validSpecs;
    }

    private getDuration(suite: any) {
        if (!suite._started || !suite._finished) {
            return 0;
        }
        const duration = (suite._finished - suite._started) / 1000;
        return (duration < 1) ? duration : Math.round(duration);
    }

    private isSpecReportable(spec: any): boolean {
        return (this.opts.reportOnlyFailedSpecs && spec.status === 'failed') || !this.opts.reportOnlyFailedSpecs;
    }

    private printFailedUrl(spec: any) {
        if (spec.status !== 'failed' || !this.opts.reportFailedUrl) {
            return '';
        }

        return JSON.stringify({
            failedUrl: spec.failedAtUrl
        });
    }

    private printReasonsForFailure(spec: any) {
        if (spec.status !== 'failed') {
            return {};
        }

        spec.failedExpectations.forEach(failed => failed.stack = undefined);

        return {
            reasons: spec.failedExpectations
        };
    }
}