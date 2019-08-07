import {browser, Builder, promise, ProtractorBrowser} from "protractor";
import {Profile, Options} from "selenium-webdriver/firefox";

export default class Browser {
    private static browser: ProtractorBrowser;

    public static getBrowser(): ProtractorBrowser {
        if (this.browser === undefined) {
            this.browser = browser;

            this.browser.driver.manage().window().maximize();
        }

        return this.browser;
    }

    public static get(urlAction: string, urlParams?: string): promise.Promise<any> {
        let url = this.getBaseUrl() + this.getBaseHref() + urlAction + '?' + 'vid=' + this.getVid() + (urlParams ? '&' + urlParams : '');
        console.log(url);
        return this.getBrowser().get(url);
    }

    public static goto(url: string): promise.Promise<any> {
        return this.getBrowser().get(url);
    }

    private static getBaseUrl(): string {
        return this.getBrowser().params.baseUrl;
    }

    private static getBaseHref(): string {

        console.log('this.getBrowser().params.isVe: ' + this.getBrowser().params.isVe);
        return this.getBrowser().params.isVe === 'true' ? '/discovery' : '/primo-explore';
    }

    private static getVid(): string {
        return this.getBrowser().params.vid;
    }

    public static waitForAngular(): promise.Promise<any> {
        return this.getBrowser().waitForAngular();
    }

    public static close(): void {
        this.getBrowser().close().then(() => {
            this.browser = undefined;
        });
    }
}