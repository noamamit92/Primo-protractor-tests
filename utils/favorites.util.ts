import {by, element, promise} from "protractor";
import {Browser} from "./browser.util";

export class FavoritesUtil {
    public static readonly pin_selector: string = '.pin-button[type="button"]';
    public static readonly go_to_favorites_button_selector:string = '#favorites-button';

    public static goToFavorites(): promise.Promise<void> {
        return element(by.css(this.go_to_favorites_button_selector)).click().then(() => {
            return Browser.waitForAngular();
        });
    }
}