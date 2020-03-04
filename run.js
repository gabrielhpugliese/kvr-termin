//@format
const { exec } = require('child_process');
const cheerio = require('cheerio');
const player = require('play-sound')((opts = {}));
const moment = require('moment');

const curl = () => {
  const args = `curl 'https://www22.muenchen.de/view-fs/termin/index.php?' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Origin: https://www22.muenchen.de' -H 'Upgrade-Insecure-Requests: 1' -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36' -H 'Sec-Fetch-User: ?1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: nested-navigate' -H 'Referer: https://www22.muenchen.de/view-fs/termin/' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7,de-DE;q=0.6,de;q=0.5' --data 'step=WEB_APPOINT_SEARCH_BY_CASETYPES&CASETYPES%5BFS+Fahrerlaubnis+erstmalig%5D=0&CASETYPES%5BFS+F%C3%BChrerschein+mit+17%5D=0&CASETYPES%5BFS+Erweiterung+Fahrerlaubnis%5D=0&CASETYPES%5BFS+Erweiterung+C+und+D%5D=0&CASETYPES%5BFS+Verl%C3%A4ngerung+des+Pr%C3%BCfauftrags%5D=0&CASETYPES%5BFS+Umtausch+in+Kartenf%C3%BChrerschein%5D=0&CASETYPES%5BFS+Abnutzung%2C+Namens%C3%A4nderung%5D=0&CASETYPES%5BFS+Ersatzf%C3%BChrerschein%5D=0&CASETYPES%5BFS+Internationaler+FS+beantragen%5D=0&CASETYPES%5BFS+Internationaler+FS+bei+Besitz%5D=0&CASETYPES%5BFS+Umschreibung+EU+EWR+FS+beantragen%5D=0&CASETYPES%5BFS+Umschreibung+Ausl%C3%A4ndischer+FS%5D=1&CASETYPES%5BFS+Verl%C3%A4ngerung+der+Fahrberechtigung+bei+befristetem+Aufenthalt%5D=0&CASETYPES%5BFS+Verl%C3%A4ngerung+C-+D-Klasse%5D=0&CASETYPES%5BFS+Eintragung+BKFQ+ohne+Verl%C3%A4ngerung%5D=0&CASETYPES%5BFS+Fahrerlaubnis+nach+Entzug%5D=0&CASETYPES%5BFS+Zuerkennung+der+ausl%C3%A4ndischen+Fahrerlaubnis%5D=0&CASETYPES%5BFS+PBS+f%C3%BCr+Taxi+etc+beantragen%5D=0&CASETYPES%5BFS+PBS+verl%C3%A4ngern%5D=0&CASETYPES%5BFS+Ersatz+PBS%5D=0&CASETYPES%5BFS+Dienstf%C3%BChrerschein+umschreiben%5D=0&CASETYPES%5BFS+Internationaler+FS+bei+Besitz%5D=0&CASETYPES%5BFS+Abholung+F%C3%BChrerschein%5D=0&CASETYPES%5BFS+Abholung+eines+Personenbef%C3%B6rderungsscheines%5D=0&CASETYPES%5BFS+Ausk%C3%BCnfte+lfd+Antrag+allgemein%5D=0&CASETYPES%5BFS+Auskunft+%2F+Beratung+zur+Begutachtung%5D=0&CASETYPES%5BFS+Ausk%C3%BCnfte+lfd+Antrag+Bet%C3%A4ubungsmittel%5D=0&CASETYPES%5BFS+Auskunft+zur+Entziehung+des+F%C3%BChrerscheins%5D=0&CASETYPES%5BFS+Punktesystem%5D=0&CASETYPES%5BFS+Fahrerlaubnis+auf+Probe%5D=0&CASETYPES%5BFS+Fahrlehrererlaubnis+beantragen%5D=0&CASETYPES%5BFS+Eintragungen+Fahrlehrerschein%5D=0&CASETYPES%5BFS+Fahrschulerlaubnis%2C+Zweigstellenerlaubnis+beantragen%5D=0&CASETYPES%5BFS+Anmeldung+und+Vereinbarung+Pr%C3%BCftermin%5D=0&CASETYPES%5BFS+Allgemeine+Information+zur+Ortskundepr%C3%BCfung%5D=0&CASETYPES%5BFS+Besprechung+des+Pr%C3%BCfungsergebnisses%5D=0' --compressed`;

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
setTimeout(() => {
  run();
}, 30 * 1000);
