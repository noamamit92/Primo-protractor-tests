import {Config} from "protractor";

export const config: Config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['tests/*.spec.js'],
    framework: "jasmine",
    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: ['--no-sandbox']
        }
    },
    noGlobals: true
};