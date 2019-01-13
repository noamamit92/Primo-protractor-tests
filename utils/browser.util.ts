import {browser, promise, ProtractorBrowser} from "protractor";

export class Browser {
    private static browser: ProtractorBrowser;

    public static getBrowser(): ProtractorBrowser {
        if (this.browser === undefined) {
            this.browser = browser;
            this.browser.driver.manage().window().maximize();
        }

        return this.browser;
    }

    public static get(urlAction: string, urlParams: string): promise.Promise<any> {
        let url = this.getBrowser().get( this.getBaseUrl() + this.getBaseHref() + urlAction + '?' + 'vid=' + this.getVid() + '&' + urlParams);
        console.log(url);
        return url;
    }

    private static getBaseUrl(): string {
        return this.getBrowser().params.baseUrl;
    }

    private static getBaseHref(): string {
        return this.getBrowser().params.isVe === 'true' ? '/discovery' : '/primo-explore';
    }

    private static getVid(): string {
        return this.getBrowser().params.vid;
    }

    public static waitForAngular(): promise.Promise<any> {
        return this.getBrowser().waitForAngular();
    }

    public static close(): promise.Promise<void> {
        return this.getBrowser().close();
    }
}