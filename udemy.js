const puppet = require('puppeteer');
var fs = require('fs');

async function scrapeUrl() {


    var jsonObj = JSON.parse(fs.readFileSync('categoryText.json'));
    console.log(jsonObj.length);
    var jsonDataFile = [];
    const browser = await puppet.launch(
        { headless: false }
    );

    for (i = 0; i < jsonObj.length; i++) {
        page = await browser.newPage();
        await page.setViewport({
            width: 1200,
            height: 800
        });

        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (req.resourceType() === 'image') {
                req.abort();
            }
            else {
                req.continue();
            }
        });
        var tmpData = await getScrapeData(page, jsonObj[i]['url']);
        if (tmpData) {
            jsonDataFile.push(tmpData);
        }
        console.log(jsonDataFile);

    }

}

async function getScrapeData(page, url) {
    try {
        var jsonData = { 'url': url, 'title': "", 'img': "", 'category': "", 'text': "" }
        await page.goto(url);

        const xpath_expression = '(//div[@class="ud-component--course-landing-page-udlite--introduction-asset"])[1]';
        await page.waitForXPath(xpath_expression);
        let elHandle = await page.$x('(//div[@class="ud-component--course-landing-page-udlite--introduction-asset"])[1]');
        let lamudiNewPropertyCount = await page.evaluate(el => el.attributes[1].textContent, elHandle[0]);
        // const elmnt = await page.$x(xpath_expression);
        const json = JSON.parse(lamudiNewPropertyCount);

        const link = json["images"]["image_480x270"];
        console.log(link);

        jsonData['img'] = link;

        await page.close();
        return jsonData;
    } catch (error) {
        console.log(error);
    }


}

scrapeUrl();