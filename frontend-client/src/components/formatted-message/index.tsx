import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedHTMLMessage, FormattedMessage as FormattedMessageBase } from 'react-intl';
import { RootState } from 'redux/rootReducer';

interface StateProps {
  currency: string;
  massUnit: string;
}

interface OwnProps {
  id: string;
  html?: boolean;
}

type FormattedMessageProps = StateProps & OwnProps;

function FormattedMessage({ id, html, currency, massUnit }: FormattedMessageProps) {
  const Formatter = html ? FormattedHTMLMessage : FormattedMessageBase;
  return (
    <Formatter
      id={id}
      values={{
        currency,
        massUnit
      }}
    />
  );
}

export default connect<StateProps, unknown, OwnProps>((state: RootState) => ({
  currency: state.settings.currency,
  massUnit: state.settings.unit
}))(FormattedMessage);
