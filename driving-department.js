//@format
const { exec } = require('child_process');
const cheerio = require('cheerio');
const player = require('play-sound')((opts = {}));
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { default: Axios } = require('axios');
const inquirer = require('inquirer');

let SALUTATION = '';
let NAME = '';
let BIRTHDAY = '';
let EMAIL = '';
let DAYS_IN_ADVANCE = '';
let PHPSESSID = '';
let TERMIN_ID = '';
let check_dates_curl = null;

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

const promptUserInformation = async () => {
  const prompt = inquirer.createPromptModule();
  
  let lastAnswers = {};
  try {
    lastAnswers = require('./last-answers.json');
  } catch (e) { }
  
  const answers = await prompt([
    {
      message: 'Salutation',
      name: 'salutation',
      default: lastAnswers['salutation'] || null,
      type: 'list',
      choices: ['Herr', 'Frau', 'Dr'],
    },
    {
      message: 'Name',
      name: 'name',
      default: lastAnswers['name'] || null,
    },
    {
      message: 'Birth date (DD.MM.YYYY)',
      name: 'birthdate',
      default: lastAnswers['birthdate'] || null,
    },
    {
      message: 'E-mail',
      name: 'email',
      default: lastAnswers['email'] || null,
    },
    {
      message: 'Days in advance',
      name: 'days_in_advance',
      default: lastAnswers['days_in_advance'] || '30',
    },
  ]);

  SALUTATION = answers['salutation'];
  NAME = answers['name'];
  BIRTHDAY = answers['birthdate'];
  EMAIL = answers['email'];
  DAYS_IN_ADVANCE = answers['days_in_advance'];

  fs.writeFileSync(path.resolve(__dirname, 'last-answers.json'), JSON.stringify(answers, null, 4), { encoding: 'utf8' });
}

const setUp = async () => {
  const req = await Axios.get('https://www22.muenchen.de/view-fs/termin/')
  const $ = cheerio.load(req.data);

  /* Request type of appointment */
  const prompt = inquirer.createPromptModule();
  const inputs = $('[name^="CASETYPES"]');
  const options = inputs.siblings('label')
    .map((index, el) =>
      $(el).text()
        .replace('aufrufen', '')
        .replace('Weitere Informationen zur Dienstleistung', '')
        .replace('Dienstleistung', '')
        .trim())
    .toArray();

  const answer = await prompt({
    type: 'list',
    name: 'Which appointment do you need?',
    choices: options,
  });
  const appointmentType = Object.values(answer)[0];
  const appointmentIndex = options.indexOf(appointmentType);

  /* Sets up form data for dates check request */
  const formData = {};
  $('form [name]').each((index, input) => {
    formData[input.attribs.name] = input.attribs.value || '0';
  });

  formData[inputs.get(appointmentIndex).attribs.name] = '1';

  PHPSESSID = req.headers['set-cookie'][0].split(';')[0].split('=')[1];
  check_dates_curl = () => `curl 'https://www22.muenchen.de/view-fs/termin/index.php?' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'Cookie: PHPSESSID=${PHPSESSID}' \
--data-raw '${Object.entries(formData).map(([name, value]) => decodeURIComponent(name) + '=' + decodeURIComponent(value)).join('&')}' \
--compressed`;
}

const run = async () => {
  console.log('Running', moment().toISOString());

  if (!check_dates_curl) {
    console.log('Failed to use dates request. Aborting...');
    process.exit();
  }
  
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

(async function () {
  await promptUserInformation();
  await setUp();
  await run();

  setInterval(async () => {
    try {
      await run();
    } catch (err) {
      console.log('some error happened, trying again');
      console.error(err);
    }
  }, 30 * 1000);
})();
