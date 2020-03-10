# kvr-termin

## Install

1. `yarn install`

## Driving Department (Führerscheinstelle)

1. Go to the appointments page: https://www22.muenchen.de/view-fs/termin/index.php
2. Choose the type of the appointment
3. Change the function `check_dates_curl` with your curl copied from Chrome (go to page above > inspector > network > reload page > right click on index.php > copy > copy as cURL)
4. Run `PHPSESSID="GET_THIS_FROM_THE_CURL_URL" TERMIN_ID="GET_THIS_FROM_INSPECTING_ELEMENT" SALUTATION="Herr" NAME="Hahn Thun" BIRTHDAY="01.01.1990" EMAIL="got@it.com" DAYS_IN_ADVANCE=30 yarn drive`

For PHPSESSID you get it from the curl you copied from Chrome (Get from PHPSESSID={...here...}).

For TERMIN_ID you must choose your termin, click on Weiter/Next and then on the next page, inspect it and find the variable `jsonAppointments` inside the `<head>` tag. For example, if you choose the `Umschreibung eines ausländischen Führerscheins > Umschreibung eines ausländischen Führerscheins (kein EU/EWR-Führerschein) beantragen`, the value will be `Termin FS Allgemeinschalter_G`

For DAYS_IN_ADVANCE choose how many months in advance it should check

The other env vars are your personal info.

If a date is found, a sound will beep and the appointment will be made. Check your e-mail.

## Citizen Department (Bürgerburo) - ONLY RUPPERTSTRASSE

1. Go to the appointments page: https://www.muenchen.de/rathaus/terminvereinbarung_bb.html
2. Choose Rupperstrasse
3. Change the function `check_dates_curl` with your curl copied from Chrome (go to page above > inspector > network > reload page > right click on index.php (the last one) > copy > copy as cURL)
4. Go to this site in another tab and find the number of your appointment to be used as TERMIN_ID: https://www56.muenchen.de/view-bb-aussenstellen/termin/js/dlListBB.js (E.g.: An- oder Ummeldung - Einzelperson is 1064399)
5. Run `PHPSESSID="GET_THIS_FROM_THE_CURL_URL" TERMIN_ID="GET_FROM_dlListBB" SALUTATION="Herr" NAME="Hahn Thun" BIRTHDAY="01.01.1990" EMAIL="got@it.com" DAYS_IN_ADVANCE=30 yarn kvr`

For PHPSESSID you get it from the curl you copied from Chrome (Get from PHPSESSID={...here...}).

For TERMIN_ID is basically finding it in the javascript file written above.

For DAYS_IN_ADVANCE choose how many days in advance it should check

The other env vars are your personal info.

If a date is found, a sound will beep and the appointment will be made. Check your e-mail.

==========

Good luck.

I am not responsible for any mistake made by anyone using this script. It is meant for learning purposes.
