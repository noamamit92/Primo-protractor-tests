import SearchPage from "../../utils/pages/search-page";
import Browser from "../../utils/browser-util";
import FavoritesUtil from "../../utils/pages/favorites-page";

describe('check favorites', function () {
    it('should add a record to favorites', function () {
        console.log('*** Starting favorites test ***');
        Browser.get('/search', '');
        Browser.waitForAngular();
        expect(FavoritesUtil.favoritesButtons.count()).toBe(10);

        FavoritesUtil.favoritesButtons.first().click();
        Browser.waitForAngular();
        FavoritesUtil.goToFavorites();
        expect(SearchPage.searchResults.count()).toEqual(1);
    });
});