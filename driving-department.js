//@format
const { exec } = require('child_process');
const cheerio = require('cheerio');
const player = require('play-sound')((opts = {}));
const moment = require('moment');

const {
  PHPSESSID,
  TERMIN_ID,
  SALUTATION,
  NAME,
  BIRTHDAY,
  EMAIL,
  DAYS_IN_ADVANCE,
} = process.env;

const check_dates_curl = () => `PASTE_YOUR_CURL_HERE`;

const pick_date_curl = ({ date, time }) =>
  `curl 'https://www22.muenchen.de/view-fs/termin/index.php?' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Cookie: PHPSESSID=${PHPSESSID}' --data 'step=WEB_APPOINT_NEW_APPOINT&APPOINT=${encodeURIComponent(
    TERMIN_ID,
  )}___${date}___${encodeURIComponent(time)}' --compressed`;

const finish_termin_curl = () =>
  `curl 'https://www22.muenchen.de/view-fs/termin/index.php?' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Cookie: PHPSESSID=${PHPSESSID}' --data 'step=WEB_APPOINT_SAVE_APPOINT&CONTACT%5Bsalutation%5D=${SALUTATION}&CONTACT%5Bname%5D=${encodeURIComponent(
    NAME,
  )}&CONTACT%5Bbirthday%5D=${BIRTHDAY}&CONTACT%5Bemail%5D=${encodeURIComponent(
    EMAIL,
  )}&CONTACT%5Bprivacy%5D=1' --compressed`;

const curl = (args) => {
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
  const page = await curl(check_dates_curl());
  const $ = cheerio.load(page);
  const script = $('script').get(3);

  const jsonAppointments = JSON.parse(
    $(script)
      .html()
      .split(/'/)[1],
  );

  TERMIN_ID = TERMIN_ID || Object.keys(jsonAppointments)[0];

  const appoints = jsonAppointments[TERMIN_ID].appoints;
  let found;
  Object.keys(appoints).forEach((key) => {
    if (found) {
      return;
    }

    const date = moment(key);
    const wish = moment()
      .add(DAYS_IN_ADVANCE, 'days')
      .endOf('day');

    if (date.isBefore(wish) && appoints[key].length !== 0) {
      player.play('beep-01a.mp3');
      found = {
        date: key,
        time: appoints[key][0],
      };
      console.log('found', key, appoints[key][0]);
    }
  });

  if (!found) {
    console.log('Did not find dates');
    return;
  }

  await curl(pick_date_curl(found));
  await curl(finish_termin_curl());

  console.log('got an appointment!', found.date, found.time);
  process.exit();
};

run();
setInterval(async () => {
  try {
    await run();
  } catch (err) {
    console.log('some error happened, trying again');
    console.error(err);
  }
}, 30 * 1000);
