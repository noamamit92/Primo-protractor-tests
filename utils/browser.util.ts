import {browser, promise, ProtractorBrowser} from "protractor";
import {Profile, Options} from "selenium-webdriver/firefox";

export class Browser {
    private static browser: ProtractorBrowser;

    public static getBrowser(): ProtractorBrowser {
        if (this.browser === undefined) {
            this.browser = browser;

            this.browser.getCapabilities().then((caps) => {
                switch (caps.get('browserName')) {
                    case 'firefox':
                        let profile: Profile = new Profile();
                        profile.setAcceptUntrustedCerts(true);
                        profile.setAssumeUntrustedCertIssuer(false);
                        profile.setPreference("browser.tabs.remote.autostart", false);
                        profile.setPreference("browser.tabs.remote.autostart.1", false);
                        profile.setPreference("browser.tabs.remote.autostart.2", false);
                        profile.addExtension('screenshots@mozilla.org');

                        let options: Options = new Options();
                        options.setProfile(profile);

                        caps.merge(options.toCapabilities());

                        break;
                }
            });

            this.browser.driver.manage().window().maximize();
        }

        return this.browser;
    }

    public static get(urlAction: string, urlParams?: string): promise.Promise<any> {
        let url = this.getBaseUrl() + this.getBaseHref() + urlAction + '?' + 'vid=' + this.getVid() + (urlParams ? '&' + urlParams : '');
        console.log(url);
        return this.getBrowser().get(url);
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

    public static close(): void {
        this.getBrowser().close().then(() => {
            this.browser = undefined;
        });
    }
}