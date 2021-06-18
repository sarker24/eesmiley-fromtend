import History, { HistoryColumn } from './History';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  GuestRegistrationActions,
  GuestRegistrationQuery
} from 'redux/ducks/guestRegistrations/types';
import * as actions from 'redux/ducks/guestRegistrations/';
import { useEffect } from 'react';
import { getHistoryRegistrations } from 'redux/ducks/guestRegistrations/selectors';
import { API_DATE_FORMAT } from 'utils/datetime';
import moment from 'moment';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import phraseLocalize from 'registration/GuestRegistrationHistory/utils/phraseLocalize';
import { getHasGuestTypesEnabled } from 'redux/ducks/settings/selectors';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StoreProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type HistoryContainerProps = StoreProps & DispatchProps & InjectedIntlProps;

const FixedRangeQuery: GuestRegistrationQuery = {
  startDate: moment().subtract(1, 'year').format(API_DATE_FORMAT),
  endDate: moment().format(API_DATE_FORMAT)
};

const HistoryColumns = [
  { property: 'date', translationKey: 'date' },
  { property: 'name', translationKey: 'settings.guestType.one' },
  { property: 'amount', translationKey: 'guestAmount', alignRight: true, numeric: true },
  { property: 'delete', alignRight: true, numeric: true }
];

const HistoryContainer: React.FunctionComponent<HistoryContainerProps> = (props) => {
  const {
    getRegistrations,
    deleteRegistration,
    loading,
    registrations,
    hasGuestTypesEnabled,
    intl
  } = props;
  const columns =
    hasGuestTypesEnabled === true
      ? HistoryColumns
      : HistoryColumns.filter((column) => column.property !== 'name');
  const localizedColumns: HistoryColumn[] = columns.map((column) =>
    column.translationKey
      ? {
          ...column,
          label: phraseLocalize(intl, column.translationKey)
        }
      : column
  );

  useEffect(() => {
    void getRegistrations(FixedRangeQuery);
  }, []);

  return loading ? (
    <LoadingPlaceholder />
  ) : (
    <History
      columns={localizedColumns}
      registrations={registrations}
      onDelete={deleteRegistration}
    />
  );
};

const mapState = (state: RootState) => ({
  hasGuestTypesEnabled: getHasGuestTypesEnabled(state),
  loading: state.guestRegistrations.loading,
  registrations: getHistoryRegistrations(state)
});

const mapDispatch = (dispatch: ThunkDispatch<RootState, void, GuestRegistrationActions>) => ({
  getRegistrations: (query?: GuestRegistrationQuery) => dispatch(actions.getAll(query)),
  deleteRegistration: (id: number) => dispatch(actions.deleteById(id))
});

export default connect<StoreProps, DispatchProps, unknown>(
  mapState,
  mapDispatch
)(injectIntl(HistoryContainer));
