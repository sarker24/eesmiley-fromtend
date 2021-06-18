import LoadingPlaceholder from 'components/LoadingPlaceholder';
import FailedPlaceholder from 'components/FailedPlaceholder';
import Container from 'components/container';
import { GridList, GridListTile } from '../ResponsiveGridList';
import DataPlaceholder from 'components/DataPlaceholder';
import SettingsIcon from '@material-ui/icons/Settings';
import * as registrationDispatch from 'redux/ducks/registration';
import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { Fade } from '@material-ui/core';
import GuestRegistrationTile from 'registration/RegistrationPointSelection/GuestRegistrationCardTile';
import ProductPlaceholder from 'static/img/product_placeholder.png';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { RegistrationActions } from 'redux/ducks/registration';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface OwnProps {
  initRegistrationPoints: () => void;
}

type RegistrationPointSelectionProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class RegistrationPointSelection extends React.Component<RegistrationPointSelectionProps> {
  handleSelectGuestRegistration = () => {
    const { selectGuestRegistration } = this.props;
    selectGuestRegistration();
  };

  handleTileClick = (event: React.MouseEvent<HTMLElement>, registrationPoint) => {
    const { selectRegistrationPoint, allowRegistrationsOnAnyPoint } = this.props;
    // check if user click tile or button
    // if button, go directly to registration-page
    // else display children registrationPoints

    (event.target as HTMLElement).tagName == 'IMG' || !allowRegistrationsOnAnyPoint
      ? selectRegistrationPoint(registrationPoint, false)
      : selectRegistrationPoint(registrationPoint, true);
  };

  render() {
    const {
      isScaleClient,
      initializing,
      failed,
      initRegistrationPoints,
      registrationPoints,
      intl,
      allowRegistrationsOnAnyPoint,
      showAddGuestRegistration
    } = this.props;

    if (initializing) {
      return <LoadingPlaceholder />;
    } else if (failed) {
      return <FailedPlaceholder retryHandler={initRegistrationPoints} />;
    }

    if (registrationPoints.length === 0) {
      const placeholderDescription = intl.messages['registration.no_data.description'].split('#');
      const title = intl.messages['registration.product_selection.no_data.title'];

      if (isScaleClient) {
        return <DataPlaceholder title={title} />;
      }

      return (
        <DataPlaceholder
          buttonHandler={() => {
            browserHistory.push('/settings');
          }}
          buttonIcon={<SettingsIcon />}
          title={title}
          description={
            <span>
              {placeholderDescription[0]}
              <SettingsIcon />
              {placeholderDescription[1]}
            </span>
          }
        />
      );
    }

    return (
      <Container title={<FormattedMessage id='registrationPoints' />}>
        <GridList style={{ width: '100%' }}>
          {showAddGuestRegistration ? (
            <Fade key={registrationPoints.length} in={true} timeout={750}>
              <GuestRegistrationTile
                onSelectGuestRegistration={this.handleSelectGuestRegistration}
                isSelected={true}
              />
            </Fade>
          ) : null}

          {registrationPoints
            .filter((item) => item.active && item.deletedAt == null)
            .map((item: RegistrationPoint) => (
              <Fade in={true} key={item.id} timeout={750}>
                <GridListTile
                  name={item.name}
                  image={item.image || ProductPlaceholder}
                  value={item}
                  onClick={this.handleTileClick}
                  isSelected={true}
                  allowRegistrationsOnAnyPoint={allowRegistrationsOnAnyPoint}
                />
              </Fade>
            ))}
        </GridList>
      </Container>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  isScaleClient: state.user.client === 'scale',
  initial: state.data.registrationPoints.initial,
  initializing: state.data.registrationPoints.initializing,
  failed: state.data.registrationPoints.failed,
  registrationPoints: state.data.registrationPoints.roots,
  allowRegistrationsOnAnyPoint: state.settings.allowRegistrationsOnAnyPoint,
  showAddGuestRegistration:
    state.settings.enableGuestRegistrationFlow &&
    state.registration.step === 0 &&
    state.registration.nodesHistory.length === 0
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, RegistrationActions>) => ({
  selectRegistrationPoint: (registrationPoint, registerDirectly) =>
    dispatch(registrationDispatch.selectRegistrationPoint(registrationPoint, registerDirectly)),
  selectGuestRegistration: () => dispatch(registrationDispatch.selectGuestRegistration())
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(RegistrationPointSelection));
