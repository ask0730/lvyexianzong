const puppeteer = require('puppeteer');

// 修改目标 URL
const targetUrl = 'http://www.farmer.com.cn/xwpd/nyyw/';

async function crawlData() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // 设置请求头
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });

        // 增加导航超时时间到 60 秒
        await page.goto(targetUrl, { timeout: 60000 });

        // 等待类名为 title 或 titleBg 的元素加载，超时时间设置为 10 秒
        await page.waitForSelector('.title, .titleBg', { timeout: 10000 });

        const dataItems = await page.evaluate(() => {
            const items = [];
            // 选择类名为 title 或 titleBg 的元素
            const elements = document.querySelectorAll('.title, .titleBg');
            elements.forEach((element) => {
                const title = element.textContent.trim();
                let link = element.querySelector('a')?.href;
                // 处理链接，避免重复拼接
                if (link && link.startsWith('http://www.farmer.com.cn')) {
                    link = link;
                } else if (link) {
                    link = `http://www.farmer.com.cn${link}`;
                } else {
                    link = '';
                }
                items.push({
                    title,
                    link
                });
            });
            return items;
        });

        console.log(dataItems);

        await page.close();
        await browser.close();
    } catch (error) {
        console.error('爬取失败:', error.message);
    }
}

crawlData();