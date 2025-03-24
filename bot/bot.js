const express = require('express');
const redis = require('redis');
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const app = express();
const port = 6000;
const timeout = 30000;
app.use(express.json());

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.connect();

const isValidIPv4 = (input) => {  
  const parts = input.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => /^(0|25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/.test(part));
};

app.put('/enqueue', async (req, res) => {
  if (!req.is('application/json')) {
    return res.status(400).send('Invalid content type.');
  }
  const { url, userIP } = req.body;
  
  if (!userIP || typeof userIP !== 'string' || !isValidIPv4(userIP)) {
    return res.status(400).send('Invalid user IP');
  }
  
  if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://')) || url.length > 2048) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const lua = `
      if redis.call("EXISTS", KEYS[1]) == 1 then
        return 0
      else
        redis.call("SETEX", KEYS[1], ARGV[1], ARGV[2])
        redis.call("LPUSH", KEYS[2], ARGV[3])
        return 1
      end
    `;
    const result = await redisClient.eval(lua, {
      keys: [`bot:submitted:${userIP}`, 'bot:url_queue'],
      arguments: ['1800', 'true', url],
    });

    if (result === 0) {
      return res.status(429).send('You have already submitted a URL. Please wait 30 minutes.');
    }
    console.log('Queued URL:', url);
    res.status(200).send('URL enqueued');
  } catch (err) {
    console.error('Failed to enqueue URL:', err);
    res.status(500).send('Failed to enqueue URL');
  }
});

async function processQueue() {
  while (true) {
    try {
      const url = await redisClient.lIndex('bot:url_queue', -1);
      if (url) {
        try {
          await visitUrl(url);
          console.log('Successfully processed URL:', url);
        } catch (err) {
          console.error('Error processing URL:', url, err);
        } finally {
          await redisClient.rPop('bot:url_queue');
          console.log('URL removed from queue:', url);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error('Error processing queue:', err);
    }
  }
}

async function visitUrl(url) {
  let driver;
  const flag = process.env.FLAG;

  try {
    let options = new firefox.Options();
    options.addArguments('--headless');
    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
    const caps = await driver.getCapabilities();
    const firefoxVersion = caps.get('browserVersion');
    console.log(`Firefox version: ${firefoxVersion}`);
    await driver.manage().setTimeouts({
      pageLoad: timeout,
      script: timeout
    });
    await driver.manage().window().setRect({ width: 1024, height: 768 });
    await driver.get(process.env.BASE_URL);

    await driver.executeScript(async (flag) => {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "admin" + Math.floor(Math.random() * 10000000),
          password: flag
        }),
      });

      if (!response.ok) {
        console.error(`Bot failed to authenticate! status: ${response.status}`);
        await driver.quit();
      }
      localStorage.setItem('isAuthenticated', 'true');
    }, flag);

    console.log(`Navigating to URL: ${url}`);
    await driver.get(url);
    
    await driver.wait(async () => {
      return (await driver.executeScript('return document.readyState')) === 'complete';
    }, timeout);

    const viewportSize = await driver.executeScript(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    });

    const centerX = Math.floor(viewportSize.width / 2);
    const centerY = Math.floor(viewportSize.height / 2);

    const actions = driver.actions();
    await actions.move({ x: centerX, y: centerY }).click().perform();
    console.log(`Clicking at center: (${centerX}, ${centerY})`);

    await driver.sleep(60000);

    console.log('Finished processing URL:', url);

  } catch (error) {
    console.error(`Error visiting URL ${url}:`, error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

app.get('/status', async (req, res) => {
  try {
    const urls = await redisClient.lRange('bot:url_queue', 0, -1);
    if (!urls.length) {
      return res.json({ status: 'ok', urls: [] });
    }
    return res.json({
      status: 'ok',
      urls: urls.map(url => '*'.repeat(url.length)),
    });
  } catch (err) {
    console.error('Failed to get status:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve queue status', error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Bot server listening on port ${port}`);
  processQueue();
});
