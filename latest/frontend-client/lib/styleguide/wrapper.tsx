/**
 * Created by lude on 04/04/2017.
 */
import * as React from 'react';
import { Component } from 'react';

import { IntlProvider, addLocaleData } from 'react-intl';
import * as en from 'react-intl/locale-data/en';
import * as da from 'react-intl/locale-data/da';
import translationsForUsersLocale from 'i18n/en.json';

addLocaleData([en[0], da[0]]);

const locale = 'en';

export default class Wrapper extends Component {
  render() {
    return (
      <IntlProvider locale={locale} messages={translationsForUsersLocale}>
        {this.props.children}
      </IntlProvider>
    );
  }
}
