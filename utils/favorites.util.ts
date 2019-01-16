import {by, element, promise} from "protractor";
import {Browser} from "./browser.util";

export class FavoritesUtil {
    public static readonly pin_selector: string = '.pin-button[type="button"]';
    public static readonly go_to_favorites_button_selector:string = '#favorites-button';

    public static goToFavorites() {
        var goToFavorites =  element(by.css(this.go_to_favorites_button_selector));
        goToFavorites.click();
        Browser.waitForAngular();
    }
}