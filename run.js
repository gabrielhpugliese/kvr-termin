//@format
const { exec } = require('child_process');
const cheerio = require('cheerio');
const player = require('play-sound')((opts = {}));
const moment = require('moment');

const curl = () => {
  const args = `PASTE_THE_CURL_FROM_CHROME_HERE`;

  return new Promise((resolve, reject) => {
    exec(args, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(stdout);
    });
  });
};

const run = async () => {
  console.log('Running', moment().toISOString());
  const page = await curl();
  const $ = cheerio.load(page);
  const script = $('script').get(3);

  const jsonAppointments = JSON.parse(
    $(script)
      .html()
      .split(/'/)[1],
  );

  const appoints = jsonAppointments['Termin FS Allgemeinschalter_G'].appoints;

  Object.keys(appoints).forEach((key) => {
    const date = moment(key);
    const wish = moment()
      .add(1, 'month')
      .endOf('day');

    if (date.isBefore(wish) && appoints[key].length !== 0) {
      player.play('beep-01a.mp3');
      console.log(key, appoints[key]);
    }
  });
};

run();
setInterval(async () => {
  try {
    await run();
  } catch (err) {}
}, 30 * 1000);
