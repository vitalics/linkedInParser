const { browser, by } = require('protractor');

describe('Visit base url', function () {
    browser.waitForAngularEnabled(false);

    browser.driver.manage().window().maximize();
    it('title shout be true', async () => {
        await browser.get(browser.baseUrl);
        await browser.switchTo().frame(0);

        const elem = await browser.findElement(by.css('.sign-in-link'));
        await elem.click();

        const { email, password } = browser.params.login;
        const { username } = browser.params.search

        await (await browser.findElement(by.css('#session_key-login'))).sendKeys(email);
        await (await browser.findElement(by.css('#session_password-login'))).sendKeys(password);
        await (await browser.findElement(by.css('input[type="submit"]'))).click();
        await browser.sleep(5000);

        const searchElem = await browser.findElement(by.css('input[role="combobox"]'))

        await searchElem.click();

        await searchElem.sendKeys(username);
    })
});
