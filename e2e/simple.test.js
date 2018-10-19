const { browser, by } = require('protractor');
const { writeFileSync } = require('fs');

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

        await browser.sleep(5000);

        const searchTypeAhead = 'search-typeahead-v2__hit'
        const firstFindElem = await browser.findElement(by.css(`.${searchTypeAhead}.${searchTypeAhead}--profile-entity`));

        firstFindElem.click();

        await browser.sleep(5000);

        // parsing data

        const fullName = await (await browser.findElement(by.css('.pv-top-card-section__name'))).getText();

        const position = await (await browser.findElement(by.css('.pv-top-card-section__headline'))).getText();

        const experienceElems = await (await browser.findElements(by.css('.pv-profile-section__sortable-card-item')));
        const lastExperienceEl = experienceElems[0];

        const lastExperienceCompanyName = await (await lastExperienceEl.findElement(by.css('.pv-entity__secondary-title'))).getText();
        const lastExperienceCompanyTitle = await (await lastExperienceEl.findElement(by.css('h3'))).getText();
        const lastExperienceCompanyLogoUrl = await (await lastExperienceEl.findElement(by.css('.pv-entity__logo-img'))).getAttribute('src');

        // expandButton
        await (await browser.findElement(by.css('.pv-profile-section__card-action-bar'))).click();

        const categoryList = await browser.findElements(by.css('.pv-skill-category-list'));
        const resolverArray = await Promise.all(categoryList);
        const category = resolverArray.find(async (category) => {
            const header = await category.findElement(by.css('.pv-skill-categories-section__secondary-skill-heading'));
            const text = await header.getText();
            return (text === 'Инструменты и технологии' || text === 'Tools & Technologies');
        });

        console.dir(category);
        const toolsAndTechnologies = await category.findElements(by.css('.pv-skill-category-entity'));


        const exportJson = {
            name: fullName,
            position,
            companyName: lastExperienceCompanyName,
            companyTitle: lastExperienceCompanyTitle,
            companyLogoUrl: lastExperienceCompanyLogoUrl,
            toolsAndTechnologies
        };

        writeFileSync(`./${fullName}.json`, JSON.stringify(exportJson), { encoding: 'utf-8' });
    });
});
