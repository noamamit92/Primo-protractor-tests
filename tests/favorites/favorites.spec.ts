import SearchPage from "../../utils/pages/search-page";
import Browser from "../../utils/browser-util";
import FavoritesPage from "../../utils/pages/favorites-page";

describe('check favorites', function () {
    it('should add a record to favorites', function () {
        console.log('*** Starting favorites test ***');
        SearchPage.search("favorites", SearchPage.scopes[0].tab, SearchPage.scopes[0]['scope-id'])
        SearchPage.resultCountValueForFavorites().then((counter) => {
            if (counter && counter > 0) {
                if (FavoritesPage.favoritesButtons) {
                    FavoritesPage.favoritesButtons.first().click();
                    Browser.waitForAngular();
                    FavoritesPage.goToFavorites();
                    SearchPage.resultCountValueForFavorites().then((count)=>{
                        expect(count).toEqual(1);
                    });

                }
            }
        })


    });
});