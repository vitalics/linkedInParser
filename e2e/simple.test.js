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

        await browser.sleep(2000);

        const searchTypeAhead = 'search-typeahead-v2__hit'
        const firstFindElem = await browser.findElement(by.css(`.${searchTypeAhead}.${searchTypeAhead}--profile-entity`));

        firstFindElem.click();

        await browser.sleep(2000);

        // parsing data

        const fullName = await (await browser.findElement(by.css('.pv-top-card-section__name'))).getText();

        const position = await (await browser.findElement(by.css('.pv-top-card-section__headline'))).getText();

        const experienceElems = await (await browser.findElements(by.css('.pv-profile-section__sortable-card-item')));
        const lastExperienceEl = experienceElems[0];

        const lastExperienceCompanyName = await (await lastExperienceEl.findElement(by.css('.pv-entity__secondary-title'))).getText();
        const lastExperienceCompanyTitle = await (await lastExperienceEl.findElement(by.css('h3'))).getText();
        const lastExperienceCompanyLogoUrl = await (await lastExperienceEl.findElement(by.css('.pv-entity__logo-img'))).getAttribute('src');

        const lastExperienceCompanyDuration = await (await lastExperienceEl.findElement(by.css('.pv-entity__bullet-item-v2'))).getText();

        console.dir(lastExperienceCompanyDuration);
        // expandButton
        await (await browser.findElement(by.css('.pv-profile-section__card-action-bar'))).click();
        // tools and technologies
        await browser.sleep(3 * 1000);

        const categoryList = await browser.findElement(by.css('.pv-skill-categories-section__expanded'));
        // let category;
        const toolsHeader = await categoryList.findElement(by.xpath('//h3[text()="Tools & Technologies"]')); // заменить на англ
        const toolsEls = await (await toolsHeader.findElement(by.xpath('..'))).findElements(by.css('.pv-skill-category-entity__name'));
        const texts = await Promise.all(toolsEls.map(async tool => tool.getText())) || [];

        //education experience
        const educationEls = await browser.findElements(by.css('.pv-education-entity'));
        let globalEducation = 0;
        const education = await Promise.all(educationEls.map(async el => {
            const timeEls = await el.findElements(by.css('time'));
            const time = await Promise.all(timeEls.map(async t => t.getText())) || [];
            const calcTime = time.reduce((prev, next) => Math.abs(prev - next));
            globalEducation += calcTime;
        }));

        console.dir(`calc Time: ${globalEducation}`);

        const exportJson = {
            name: fullName,
            position,
            currentCompanyName: lastExperienceCompanyName,
            currentCompanyTitle: lastExperienceCompanyTitle,
            currentCompanyLogoUrl: lastExperienceCompanyLogoUrl,
            currentCompanyExperience: lastExperienceCompanyDuration,
            skills: texts,
            education: globalEducation,
        };

        writeFileSync(`./${fullName}.json`, JSON.stringify(exportJson), { encoding: 'utf-8' });
    }, 5 * 60 * 1000);
}, 6 * 60 * 1000);
