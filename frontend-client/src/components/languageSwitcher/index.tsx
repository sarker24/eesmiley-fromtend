import * as React from 'react';
import { Select, MenuItem } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';

import da from 'static/img/country-flags/dk.png';
import en from 'static/img/country-flags/en.png';
import sv from 'static/img/country-flags/sv.png';
import nb from 'static/img/country-flags/nb.png';
import is from 'static/img/country-flags/is.png';
import fi from 'static/img/country-flags/fi.png';
import de from 'static/img/country-flags/de.png';
import { RootState } from 'redux/rootReducer';

const nations = ['da', 'en', 'fi', 'is', 'sv', 'nb', 'de'] as const;
const flags = { da, en, fi, is, sv, nb, de } as const;
const useStyles = makeStyles({
  select: {
    width: '100%'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'row nowrap',
    minWidth: '100px'
  },
  image: {
    height: '30px',
    marginRight: '15px'
  },
  icon: {},
  text: {}
});

type StoreProps = ReturnType<typeof mapStateToProps>;

interface OwnProps {
  // if value is provided, store is not used; a bit of a quick fix;
  // should extract out store usage to parent
  value?: string;
  onChange: (locale: string) => void;
  className?: string;
  classes?: ClassesOverride<typeof useStyles>;
  name?: string;
}

export type LanguageSwitcherProps = StoreProps & InjectedIntlProps & OwnProps;

const LanguageSwitcher: React.FunctionComponent<LanguageSwitcherProps> = (props) => {
  const classes = useStyles(props);
  const { onChange, locale, isAdmin, className, intl, name } = props;
  /**
   * Calls the onChange handler received from the parent component with the chosen language string
   * @param { React.MouseEvent<HTMLElement> } e: Mouse Event
   * @param { number } value: Index value used to return the right property
   * @public
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.stopPropagation();
    e.preventDefault();
    onChange(e.target.value);
  };

  return (
    <Select
      className={classNames(classes.select, className)}
      disableUnderline
      value={locale}
      onChange={handleChange}
      name={name}
    >
      {isAdmin && <MenuItem value={'phraseapp'}>PhraseApp Keys</MenuItem>}
      {nations.map((nation, i) => (
        <MenuItem key={i} value={nation}>
          <div className={classes.menuItem}>
            <div className={classes.icon}>
              <img className={classes.image} src={flags[nation]} />
            </div>
            <div className={classes.text}>{intl.messages[`languages.${nation}`]}</div>
          </div>
        </MenuItem>
      ))}
    </Select>
  );
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { tokenPayload } = state.auth;
  return {
    locale: ownProps.value || state.ui.locale,
    isAdmin: tokenPayload && tokenPayload.isAdmin
  };
};

export default connect<StoreProps, unknown, OwnProps>(mapStateToProps)(
  injectIntl(LanguageSwitcher)
);
