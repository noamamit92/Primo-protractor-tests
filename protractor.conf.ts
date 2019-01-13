import {Config} from "protractor";

export const config: Config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        baseUrl: 'https://primo-demo.hosted.exlibrisgroup.com',
        vid: 'NORTH',
        isVe: false
    },
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