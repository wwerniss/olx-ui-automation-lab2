const { By, Key, until } = require('selenium-webdriver');

class MainPage {
    constructor(driver) {
        this.driver = driver;
        this.sleepTime = 5 * 1000;
        this.searchField = By.id('search');
        this.searchBtn = By.css('button[data-testid="search-submit"]');
        this.priceInput = By.css("input[data-testid='range-from-input']");
        this.locationInput = By.css('input#location-input');
        this.profileBtn = By.css("a[data-testid='myolx-link']");
        this.cookieBtn = By.css('button[data-testid="dismiss-cookies-banner"], button[data-testid="dismiss-cookie-banner"]');
        this.transportCategory = By.xpath("//a[contains(@href, 'transport') or .//span[contains(text(), 'Транспорт')]]");
    }

    async open() {
        await this.driver.get('https://www.olx.ua/uk/');
        try {
            const btn = await this.driver.wait(until.elementLocated(this.cookieBtn), 5000);
            await btn.click();
        } catch (e) {/* ignored */ }
    }

    async waitAndSearch(text) {
        const input = await this.driver.wait(until.elementLocated(this.searchField), 20000);
        await this.driver.wait(until.elementIsVisible(input), 10000);
        await input.clear();
        await input.sendKeys(text, Key.RETURN);

        const countElement = await this.driver.wait(until.elementLocated(By.css('[data-testid="total-count"]')), 15000);
        await this.driver.wait(until.elementIsVisible(countElement), 10000);
        await this.driver.sleep(this.sleepTime);
    }
}

module.exports = MainPage;