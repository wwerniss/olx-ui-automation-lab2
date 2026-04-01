const { By, until, Key } = require('selenium-webdriver');

class SearchResultsPage {
    constructor(driver) {
        this.driver = driver;
        this.sleepTime = 8 * 1000;
        this.minPriceInput = By.css("input[data-testid='range-from-input']");
        this.maxPriceInput = By.css("input[data-testid='range-to-input']");
        this.applyFilterBtn = By.css("button[data-testid='page-search-button']");
        this.sortingDropdown = By.css("div[data-testid='sorting']");
        this.onlyWithPhotoCheckbox = By.xpath('//label[contains(., "Тільки з фото")]');
        this.listingResult = By.css("div[data-cy='l-card']");
        this.listingPrice = By.css("p[data-testid='ad-price']");
        this.listingTitle = By.css("h6");
        this.listingFavoriteBtn = By.css('[data-testid="adAddToFavorites"]');
        this.loginModal = By.css('[data-testid="observed-log-in"]');
    }

    async setPriceFilter(minPrice, maxPrice) {
        if (minPrice) {
            const minField = await this.driver.wait(until.elementLocated(this.minPriceInput), 10000);
            await this.driver.wait(until.elementIsVisible(minField), 5000);
            await minField.clear();
            await minField.sendKeys(minPrice);
        }
        if (maxPrice) {
            const maxField = await this.driver.wait(until.elementLocated(this.maxPriceInput), 10000);
            await this.driver.wait(until.elementIsVisible(maxField), 5000);
            await maxField.clear();
            await maxField.sendKeys(maxPrice, Key.RETURN);
        }
        await this.driver.sleep(this.sleepTime);
    }

    async toggleOnlyWithPhoto() {
        const checkbox = await this.driver.wait(until.elementLocated(this.onlyWithPhotoCheckbox), 10000);
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", checkbox);
        await this.driver.wait(until.elementIsVisible(checkbox), 5000);
        await checkbox.click();
        await this.driver.sleep(this.sleepTime);
    }

    async selectSortingNewest() {
        const dropdownLocator = By.css("button[aria-controls='sorting-listbox'], div[data-testid='sorting']");
        const dropdown = await this.driver.wait(until.elementLocated(dropdownLocator), 10000);
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", dropdown);
        await this.driver.wait(until.elementIsVisible(dropdown), 5000);
        await dropdown.click();

        const newestOption = By.xpath("//*[@id='sorting-listbox']//*[contains(text(), 'Найновіші') or contains(text(), 'Нові')] | //*[contains(@role, 'option') and (contains(text(), 'Найновіші') or contains(text(), 'Нові'))]");
        const option = await this.driver.wait(until.elementLocated(newestOption), 5000);
        await this.driver.wait(until.elementIsVisible(option), 5000);
        await option.click();
        await this.driver.sleep(this.sleepTime);
    }

    async clickFirstListingFavorite() {
        const listing = await this.driver.wait(until.elementLocated(this.listingResult), 15000);
        const favBtn = await listing.findElement(this.listingFavoriteBtn);
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", favBtn);
        await this.driver.wait(until.elementIsVisible(favBtn), 5000);
        await favBtn.click();
    }

    async waitForLoginModal() {
        const modal = await this.driver.wait(until.elementLocated(this.loginModal), 10000);
        await this.driver.wait(until.elementIsVisible(modal), 5000);
        return true;
    }

    async getListingPrices() {
        await this.driver.wait(until.elementLocated(this.listingResult), 15000);
        const prices = await this.driver.findElements(this.listingPrice);
        return Promise.all(prices.map(async p => await p.getText()));
    }

    async getListingTitles() {
        await this.driver.wait(until.elementLocated(this.listingResult), 15000);
        const cards = await this.driver.findElements(this.listingResult);

        let titlesArray = [];
        for (let c of cards) {
            try {
                const titleEls = await c.findElements(By.css("h6, h4, h3, div[data-cy='ad-card-title']"));
                if (titleEls.length > 0) {
                    const text = await titleEls[0].getText();
                    if (text) titlesArray.push(text);
                }
            } catch (e) {
            }
        }
        return titlesArray;
    }
}

module.exports = SearchResultsPage;
