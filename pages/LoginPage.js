const { By, until, Key } = require('selenium-webdriver');

class LoginPage {
    constructor(driver) {
        this.sleepTime = 8 * 1000;
        this.driver = driver;
        this.emailInput = By.name('username');
        this.passwordInput = By.name('password');
        this.loginSubmitBtn = By.css('button[data-testid="login-submit-button"]');
        this.errorMessage = By.css('[data-testid="error-banner"], #error-banner, [data-testid="error-message"]');
    }

    async login(email, password) {
        const emailField = await this.driver.wait(until.elementLocated(this.emailInput), 10000);
        await this.driver.wait(until.elementIsVisible(emailField), 5000);
        await emailField.clear();
        await emailField.sendKeys(email);

        const passwordField = await this.driver.wait(until.elementLocated(this.passwordInput), 5000);
        await passwordField.clear();
        await passwordField.sendKeys(password);

        try {
            const submitBtn = await this.driver.wait(until.elementLocated(this.loginSubmitBtn), 5000);
            await submitBtn.click();
        } catch (e) {
            const genericBtn = await this.driver.findElement(By.css('button[type="submit"]'));
            await genericBtn.click();
        }
        await this.driver.sleep(this.sleepTime);
    }

    async waitForError() {
        const errorEl = await this.driver.wait(until.elementLocated(this.errorMessage), 10000);
        await this.driver.wait(until.elementIsVisible(errorEl), 5000);
        return await errorEl.getText();
    }
}

module.exports = LoginPage;
