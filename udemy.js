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
        var jsonData = { 'url': url, 'title': "", 'img': "", 'category': "Databases", 'subtitle': "" }

        await page.goto(url);

        // Image link scraper
        const xpath_expression = '(//div[@class="ud-component--course-landing-page-udlite--introduction-asset"])[1]';
        await page.waitForXPath(xpath_expression);
        let elHandleimg = await page.$x('(//div[@class="ud-component--course-landing-page-udlite--introduction-asset"])[1]');
        let imgurl = await page.evaluate(el => el.attributes[1].textContent, elHandleimg[0]);

        const jsonimg = JSON.parse(imgurl);
        const link = jsonimg["images"]["image_240x135"];
        console.log(link);
        jsonData['img'] = link;

        // Title scraper

        const xpath_title = '(//h1[@class="udlite-heading-xl clp-lead__title clp-lead__title--small"][1])'; // wait for element defined by XPath appear in page
        await page.waitForXPath(xpath_title);
        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        let elHandletitle = await page.$x(xpath_title);
        // prepare to get the textContent of the selector above (use page.evaluate)
        let title = await page.evaluate(el => el.textContent, elHandletitle[0]);
        console.log(title);

        jsonData['title'] = title.replace(/(\r\n|\n|\r)/gm, "");

        // Subtitle 

        const xpath_subtitle = '(//div[@class="udlite-text-md clp-lead__headline"][1])'; // wait for element defined by XPath appear in page
        await page.waitForXPath(xpath_subtitle);
        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        let elHandlesub = await page.$x(xpath_subtitle);
        // prepare to get the textContent of the selector above (use page.evaluate)
        let subtitle = await page.evaluate(el => el.textContent, elHandlesub[0]);
        console.log(subtitle);

        jsonData['subtitle'] = subtitle.replace(/(\r\n|\n|\r)/gm, "");

        // rating

        const xpath_rating = '(//div[@class="ud-component--course-landing-page-udlite--rating"]/div/span/span[2])'; // wait for element defined by XPath appear in page
        await page.waitForXPath(xpath_rating);
        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        let elHandlerating = await page.$x(xpath_rating);
        // prepare to get the textContent of the selector above (use page.evaluate)
        let rating = await page.evaluate(el => el.textContent, elHandlerating[0]);
        console.log(rating);

        jsonData['rating'] = rating;

        // entollements

        const xpath_entollment = '(//div[@class="enrollment"][1])'; // wait for element defined by XPath appear in page
        await page.waitForXPath(xpath_entollment);
        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        let elHandleenroll = await page.$x(xpath_entollment);
        // prepare to get the textContent of the selector above (use page.evaluate)
        let enrollments = await page.evaluate(el => el.textContent, elHandleenroll[0]);
        console.log(enrollments);

        jsonData['enrollments'] = enrollments.replace(/(\r\n|\n|\r)/gm, "");

        // Duration

        const xpath_duration = '(//div[@class="ud-component--course-landing-page-udlite--course-content-length"]/div/span/span[1])'; // wait for element defined by XPath appear in page
        await page.waitForXPath(xpath_duration);
        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        let elHandleduaration = await page.$x(xpath_duration);
        // prepare to get the textContent of the selector above (use page.evaluate)
        let duration = await page.evaluate(el => el.textContent, elHandleduaration[0]);
        console.log(duration);

        jsonData['duration'] = duration;

        await page.close();
        return jsonData;
    } catch (error) {
        console.log(error);
    }
}

scrapeUrl();