import {by, element} from "protractor";
import {SearchUtil} from "../../utils/search.util";
import {Browser} from "../../utils/browser.util";
import {FavoritesUtil} from "../../utils/favorites.util";

describe('check favorites', function () {
    it('should add a record to favorites', function () {
        Browser.get('/search', '').then(() => {
            SearchUtil.search('nothing');

            Browser.waitForAngular().then(() => {
                let favoritesButtons = element.all(by.css(FavoritesUtil.pin_selector));
                expect(favoritesButtons.count()).toBe(10);
                favoritesButtons.first().click();

                Browser.waitForAngular().then(() => {
                    FavoritesUtil.goToFavorites().then(() => {
                        return SearchUtil.assertNumberOfResultsAppeared(1);
                    });
                });
            });
        });
    });
});