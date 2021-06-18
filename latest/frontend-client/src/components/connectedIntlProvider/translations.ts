import { addLocaleData } from 'react-intl';
import * as en from 'react-intl/locale-data/en';
import * as da from 'react-intl/locale-data/da';
import * as sv from 'react-intl/locale-data/sv';
import * as nb from 'react-intl/locale-data/nb';
import * as fi from 'react-intl/locale-data/fi';
import * as is from 'react-intl/locale-data/is';
import * as de from 'react-intl/locale-data/de';
import enJson from 'i18n/en.json';
import daJson from 'i18n/da.json';
import svJson from 'i18n/sv.json';
import nbJson from 'i18n/nb.json';
import deJson from 'i18n/de.json';
import isJson from 'i18n/is.json';
import fiJson from 'i18n/fi.json';
import phraseAppJson from 'i18n/phraseapp.json';

addLocaleData([en[0], da[0], sv[0], nb[0], fi[0], is[0], de[0]]);

export default {
  en: enJson,
  da: daJson,
  sv: svJson,
  nb: nbJson,
  de: deJson,
  is: isJson,
  fi: fiJson,
  phraseapp: phraseAppJson
};
