const puppet = require('puppeteer');
var fs = require('fs');
// ecommerce   "mobile-apps",  "databases",
// "programming-languages",     "game-development"  
// "software-testing",   "software-engineering",
const categories = [
     "development-tools"
];

async function scrapeUrl(url) {
    const browser = await puppet.launch(
        { headless: false }
    );

    for (i = 0; i < categories.length; i++) {
        console.log(categories[i]);
        page = await browser.newPage();
        // console.log(pages[i])
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
        await getScrapeData(page, url, categories[i]);
    }

}

async function autoScroll(page) {

    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 200;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}

async function getScrapeData(page, url, categoryText) {

    await page.goto(url + categoryText + '/page/1');
    setTimeout(() => { }, 300);
    dataArray = [];
    for (i = 0; i < 5; i++) {
        // await page.waitForNavigation();
        await autoScroll(page);

        const xpath_expression = '/html/body/div[5]/div[1]/div[5]//a[1]';
        await page.waitForXPath(xpath_expression);
        const links = await page.$x(xpath_expression);
        const link_urls = await page.evaluate((...links) => {
            return links.map(e => e.href);
        }, ...links);

        const imgxpath_expression = '/html/body/div[5]/div[1]/div[5]//a[1]/img';
        await page.waitForXPath(imgxpath_expression);
        const imgs = await page.$x(imgxpath_expression);

        const img_urls = await page.evaluate((...imgs) => {
            return imgs.map(e => e.src);
        }, ...imgs);

        const result = link_urls.map((key, i) => ({ url: key, img: img_urls[i] }));
        dataArray.push(...result);

        const [elmnt] = await page.$x('/html/body/div[5]/div[2]/div/a[2]');
        try {
            await elmnt.click();
            await page.waitForNavigation();
        } catch (error) {
            console.log(error);
        } {

        }

    }

    var myJsonString = JSON.stringify(dataArray);
    fs.writeFile(categoryText + '.json', myJsonString, function (err, result) {
        if (err) console.log('error', err);
    });

    // await page.close();

}


scrapeUrl("url");

//  "https://udemyfreecourses.org/category/" 