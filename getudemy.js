const puppet = require('puppeteer');
var fs = require('fs');

async function scrapeUrl() {

    var jsonObj = JSON.parse(fs.readFileSync('databases.json'));
    console.log(jsonObj.length);

    const browser = await puppet.launch(
        { headless: false }
    );

    for (i = 0; i < jsonObj.length; i++) {
        try {
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
            const redirects = [];

            const client = await page.target().createCDPSession();
            await client.send('Network.enable');
            await client.on('Network.requestWillBeSent', (e) => {
                if (e.type !== "Document") {
                    return;
                }
                redirects.push(e.documentURL);
            });

            await page.goto(jsonObj[i]['url']);
            await page.waitForNavigation();

            jsonObj[i]['url'] = redirects[redirects.length - 1];
            await page.close();
        } catch (error) {
            console.log(error);
        }
    }


    var myJsonString = JSON.stringify(jsonObj);
    fs.writeFile("categoryText" + '.json', myJsonString, function (err, result) {
        if (err) console.log('error', err);
    });

}

scrapeUrl();