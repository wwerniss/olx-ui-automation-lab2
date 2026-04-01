const { Builder, until, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

const MainPage = require('../pages/MainPage');
const LoginPage = require('../pages/LoginPage');
const SearchResultsPage = require('../pages/SearchResultsPage');

describe('OLX UI Automation - Manual Tests Coverage', function () {
    let driver;
    let mainPage;
    let loginPage;
    let searchPage;

    beforeEach(async function () {
        this.timeout(60 * 1000);
        let options = new chrome.Options();
        options.addArguments('--disable-blink-features=AutomationControlled');
        options.addArguments('--start-maximized');

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        mainPage = new MainPage(driver);
        loginPage = new LoginPage(driver);
        searchPage = new SearchResultsPage(driver);

        await mainPage.open();
    });

    afterEach(async function () {
        if (driver) await driver.quit();
    });

    it('TC-01: Пошук товару за ключовим словом', async function () {
        this.timeout(60 * 1000);
        await mainPage.waitAndSearch('iPhone 15');

        const titles = await searchPage.getListingTitles();
        assert.ok(titles.length > 0, 'No results found for iPhone 15');

        const matches = titles.some(title => title.toLowerCase().includes('iphone') || title.toLowerCase().includes('15'));
        assert.ok(matches, 'The search results do not seem to contain "iPhone 15"');
    });

    it('TC-02: Фільтрація за ціною', async function () {
        this.timeout(60 * 1000);
        await mainPage.waitAndSearch('Ноутбук');

        await searchPage.setPriceFilter('10000', '20000');

        const pricesText = await searchPage.getListingPrices();
        assert.ok(pricesText.length > 0, 'No items found after price filter');

        for (let pt of pricesText) {
            const cleaned = pt.replace(/\D/g, '');
            if (cleaned) {
                const price = parseInt(cleaned, 10);
                assert.ok(price >= 10000 && price <= 20000, `Result price ${price} is out of bounds [10000-20000]`);
            }
        }
    });

    it('TC-03: Сортування за датою публікації', async function () {
        this.timeout(60 * 1000);
        await mainPage.waitAndSearch('Велосипед');

        await searchPage.selectSortingNewest();
        await driver.sleep(3000);

        const url = await driver.getCurrentUrl();
        assert.ok(url.includes('created_at:desc') || url.includes('sort=created_at'), 'URL does not contain sorting parameter for newest');

        const titles = await searchPage.getListingTitles();
        assert.ok(titles.length > 0, 'No listings found after sorting');
    });

    it('TC-04: Авторизація з некоректним паролем', async function () {
        this.timeout(60 * 1000);
        const profile = await driver.wait(until.elementLocated(mainPage.profileBtn), 15000);
        await parserWaitAndClick(profile);

        await loginPage.login('test_invalid_user_1234@ukr.net', 'WrongPass123!');

        const errorMsg = await loginPage.waitForError();
        assert.ok(errorMsg.length > 0, 'Error message was not displayed');
    });

    it('TC-05: Додавання в "Обране" (Гість)', async function () {
        this.timeout(60 * 1000);
        await mainPage.waitAndSearch('Стіл');

        await searchPage.clickFirstListingFavorite();

        const isModalVisible = await searchPage.waitForLoginModal();
        assert.ok(isModalVisible, 'Login modal (observed-log-in) was not displayed when favoring an item as guest');
    });

    it('TC-08: Перехід за категоріями', async function () {
        this.timeout(60 * 1000);
        const transportLink = await driver.wait(until.elementLocated(mainPage.transportCategory), 15000);

        await parserWaitAndClick(transportLink);

        const viewAllBtn = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Переглянути всі") or contains(text(), "Смотреть все")]')), 5000);
        await driver.wait(until.elementIsVisible(viewAllBtn), 5000);
        await viewAllBtn.click();

        await driver.wait(until.urlContains('transport'), 10000);
        const url = await driver.getCurrentUrl();
        assert.ok(url.includes('transport'), 'Did not navigate to Transport category');
    });

    it('TC-09: Фільтр "Тільки з фото"', async function () {
        this.timeout(60 * 1000);
        await mainPage.waitAndSearch('Книга');
        await driver.wait(until.titleContains('Книга'), 15000);

        await searchPage.toggleOnlyWithPhoto();
        await driver.sleep(3000);

        const url = await driver.getCurrentUrl();
        assert.ok(url.includes('search%5Bphotos%5D=1') || url.includes('photos=1') || url.match(/search[^&]+photos/),
            'URL does not contain filter for "Only with photo"');
    });

    async function parserWaitAndClick(element) {
        await driver.executeScript("arguments[0].scrollIntoView(true);", element);
        await driver.wait(until.elementIsVisible(element), 5000);
        await element.click();
    }
});
