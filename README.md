# kvr-termin

I tried only for Führerscheinstelle page: https://www22.muenchen.de/view-fs/termin/index.php

## Quick start

1. `yarn install`
2. Change the function `check_dates_curl` with your curl copied from Chrome (go to page above > inspector > network > reload page > right click on index.php > copy > copy as cURL)
3. Run `PHPSESSID="GET_THIS_FROM_THE_CURL_URL" TERMIN_ID="GET_THIS_FROM_INSPECTING_ELEMENT" SALUTATION="Herr" NAME="Hahn Thun" BIRTHDAY="01.01.1990" EMAIL="got@it.com" MONTHS_IN_ADVANCE=1 yarn start`

## Setup

For PHPSESSID you get it from the curl you copied from Chrome (Get from PHPSESSID={...here...}).

For TERMIN_ID you must choose your termin, click on Weiter/Next and then on the next page, inspect it and find the variable `jsonAppointments` inside the `<head>` tag. For example, if you choose the `Umschreibung eines ausländischen Führerscheins > Umschreibung eines ausländischen Führerscheins (kein EU/EWR-Führerschein) beantragen`, the value will be `Termin FS Allgemeinschalter_G`

For MONTHS_IN_ADVANCE choose how many months in advance it should check

The other env vars are your personal info.

If a date is found, a sound will beep.

Good luck.

I am not responsible for any mistake made by anyone using this script. It is meant for learning purposes.
