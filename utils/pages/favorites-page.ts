import {by, element, promise} from "protractor";
import Browser from "../browser-util";


export default class FavoritesPage {
    public static  goToFavoritesButton = element(by.css('#favorites-button'));
    public static favoritesButtons = element.all(by.css('.pin-button[type="button"]'));
    
    public static goToFavorites() {
        this.goToFavoritesButton.click();
        Browser.waitForAngular();
    }
}