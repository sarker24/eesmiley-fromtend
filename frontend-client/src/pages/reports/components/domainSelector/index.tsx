/**
 * DomainsSelector for new Reports module v2
 */
import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import ItemSelector from 'reports/components/itemSelector';
import {
  getAvailableRegistrationPointNames,
  getSelectedRegistrationPointNames,
} from 'redux/ducks/reports/selectors';
import { setSelectedPoints } from 'redux/ducks/reports';
import { LABEL_TO_PLURAL, LABELS } from 'utils/labels';
require('./index.scss');

/*
* The two interfaces are due to itemSelector (and its inconsistent shapes of the inputs)
* -> selected array is expecting a literal
* -> value array expects object with defined key accessor
* */
interface SelectedPointsByLabel {
  [index: string]: string[];
}

// the ItemSelector requires object and key,
// we use name as key
interface AvailablePointsByLabel {
  [label: string]: {
    [index: string]: string ;
  }[];
}

interface StateProps {
  availablePoints: AvailablePointsByLabel;
  selectedPoints: SelectedPointsByLabel;
}

interface DispatchProps {
  onChange: (label, names) => void;
}

export interface OwnProps {
  required?: boolean;
}

type DomainSelectorProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

export class DomainSelector extends React.Component<DomainSelectorProps> {

  static defaultProps = {
    required: false
  };

  handleSelectChange = (label: string, selectedNames: string[]) => {
    const { onChange } = this.props;
    onChange(label, selectedNames);
  }

  render() {

    const { intl, required } = this.props;
    let { availablePoints, selectedPoints } = this.props;

    return (
      <div className='domainSelector'>
        {
          LABELS.map(label => {
            const labelPlural = LABEL_TO_PLURAL[label];
            return (
              <div key={label} className='domainSelectorRow'>
                <ItemSelector
                  required={required}
                  className={`itemSelectField ${labelPlural}`}
                  optionIdKey='name'
                  disabled={!availablePoints[label] || availablePoints[label].length === 0}
                  floatingLabelText={intl.messages[labelPlural]}
                  selected={selectedPoints && selectedPoints[label]}
                  options={availablePoints[label]}
                  handler={names => this.handleSelectChange(label, names)}
                />
              </div>
            );
          })
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  availablePoints: getAvailableRegistrationPointNames(state),
  selectedPoints: getSelectedRegistrationPointNames(state)
});

const mapDispatchToProps = (dispatch) => ({
  onChange: (label, names) => dispatch(setSelectedPoints(label, names))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DomainSelector));
