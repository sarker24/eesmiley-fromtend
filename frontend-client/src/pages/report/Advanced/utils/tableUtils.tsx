import { InjectedIntl } from 'react-intl';
import { Localization, Options } from 'material-table';

export const getLocalization = (intl: InjectedIntl): Localization => ({
  header: {
    actions: ''
  },
  body: {
    editTooltip: intl.messages['edit'],
    deleteTooltip: intl.messages['data_table.delete'],
    emptyDataSourceMessage: intl.messages['settings.content.noRegistrationPoints'],
    editRow: {
      deleteText: intl.messages['settings.content.deleteConfirmation'],
      cancelTooltip: intl.messages['base.cancel'],
      saveTooltip: intl.messages['base.ok']
    }
  },
  pagination: {
    labelDisplayedRows: '{from}-{to}/{count}',
    previousTooltip: intl.messages['settings.content.table.prevPage'],
    nextTooltip: intl.messages['settings.content.table.nextPage'],
    labelRowsSelect: intl.messages['settings.content.table.rows'],
    lastTooltip: intl.messages['table.lastPage'],
    firstTooltip: intl.messages['table.firstPage']
  },
  toolbar: {
    searchTooltip: intl.messages['search'],
    searchPlaceholder: intl.messages['search']
  }
});

export const options: Options = {
  padding: 'dense' as const,
  sorting: true,
  pageSize: 25,
  pageSizeOptions: [25, 50, 100],
  exportAllData: true,
  showTitle: false
};
