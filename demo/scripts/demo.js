const Puppeteer = require('puppeteer-core');

const CHROME_EXECUTABLE_PATH =
  process.env.CHROME_EXECUTABLE_PATH ||
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const EDITOR_SELECTOR = '.DraftEditor-root';

const SCRIPT_TYPE_DEFAULT_DELAY = 20;
const SCRIPT_SEQUENCE_DEFAULT_DELAY = 200;

const SCRIPT_SEQUENCES = [
  {type: '# ', typeDelay: 200},
  {type: 'Hello, Draft.js!', sequenceDelay: 500},
  {press: 'Enter', sequenceDelay: 500},
  {type: 'This awesome plugin supports **bold'},
  {type: '**'},
  {type: ', *italic'},
  {type: '*'},
  {type: ', ~~strikethrough'},
  {type: '~~'},
  {type: ', `code'},
  {type: '`'},
  {type: ', [link]('},
  {paste: 'https://github.com/makeflow'},
  {type: ')'},
  {type: ', and '},
  {type: 'plain link like '},
  {type: 'https://'},
  {type: 'github.com/'},
  {type: 'vilic'},
  {type: '.'},
  {press: 'Enter', sequenceDelay: 500},
  {type: 'It also supports:'},
  {press: 'Enter', sequenceDelay: 500},
  {type: '![image block]('},
  {paste: 'image.png'},
  {type: ' 2x'},
  {type: ')', sequenceDelay: 500},
  {type: '- ', typeDelay: 200, sequenceDelay: 500},
  {type: 'Ordered or unordered list'},
  {press: 'Enter'},
  {press: 'Tab'},
  {type: 'With multiple levels'},
  {press: 'Enter', sequenceDelay: 500},
  {press: 'Enter', sequenceDelay: 500},
  {press: 'Enter', sequenceDelay: 500},
  {type: '---', typeDelay: 100, sequenceDelay: 500},
  {type: '```', typeDelay: 100, sequenceDelay: 500},
  {type: '# installation'},
  {press: 'Enter', sequenceDelay: 500},
  {type: 'yarn add '},
  {paste: 'draft-js-fluent-markdown-plugin'},
  {press: 'Enter', sequenceDelay: 500},
  {press: 'Enter', sequenceDelay: 500},
  {type: '> ', typeDelay: 200},
  {type: 'Inspired by `'},
  {paste: 'draft-js-markdown-shortcuts-plugin'},
  {type: '`'},
  {type: ' and `'},
  {paste: 'draft-js-markdown-plugin'},
  {type: '`'},
  {type: '.'},
];

main().catch(error => {
  console.error(error);
  process.exit(1);
});

async function main() {
  let browser = await Puppeteer.launch({
    headless: false,
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ['--disable-infobars'],
  });

  let [page] = await browser.pages();

  await page.setViewport({
    width: 800,
    height: 240,
    deviceScaleFactor: 2,
  });

  await page.goto('http://localhost:1234');

  await page.click(EDITOR_SELECTOR);

  await new Promise(resolve => setTimeout(resolve, 1000));

  for (let {
    type,
    paste,
    press,
    down,
    up,
    typeDelay = SCRIPT_TYPE_DEFAULT_DELAY,
    sequenceDelay = SCRIPT_SEQUENCE_DEFAULT_DELAY,
  } of SCRIPT_SEQUENCES) {
    if (type) {
      await page.keyboard.type(type, {delay: typeDelay});
    } else if (paste) {
      await page.keyboard.sendCharacter(paste);
    } else if (press) {
      await page.keyboard.press(press);
    } else if (down) {
      await page.keyboard.down(down);
    } else if (up) {
      await page.keyboard.up(up);
    }

    // scrolling hack, it scrolls hand typing, but not type using Puppeteer API.
    await page.evaluate(`
      document
        .scrollingElement
        .scrollTop = Number.MAX_SAFE_INTEGER;
    `);

    await new Promise(resolve => setTimeout(resolve, sequenceDelay));
  }
}
