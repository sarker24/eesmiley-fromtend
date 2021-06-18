import { InjectedIntl, FormattedHTMLMessage } from 'react-intl';
import { Column } from 'material-table';
import moment from 'moment';
import { Spinner } from '../../../../components/LoadingPlaceholder';
import * as React from 'react';
import { MassUnit, unformat } from 'utils/number-format';
import { TimeRange } from 'redux/ducks/reports-new';
import { AdvancedFoodwasteReport } from 'redux/ducks/reports-new/selectors';
import { SheetFormat } from 'report/Advanced/utils/tableExport';
import { parseAsText } from 'report/utils/htmlParser';

const FormattedFields = new Set(['cost', 'amount', 'co2']);

export const createTableColumnConfig = (
  intl: InjectedIntl,
  { currency, massUnit }: { currency: string; massUnit: MassUnit }
): // eslint-disable-next-line @typescript-eslint/ban-types
Column<AdvancedFoodwasteReport>[] => [
  {
    title: intl.messages['date'],
    field: 'date',
    type: 'date' as const,
    customFilterAndSearch: (value, rowData) =>
      (
        moment(rowData.date).format('DD.MM.YYYY') + moment(rowData.date).format('D MMMM YYYY')
      ).includes(value),
    render: (row) => moment(row.date).format('LL'),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    title: (intl.messages['department'] as any).one,
    field: 'account',
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.messages['hierarchy'],
    field: 'registrationPointPath',
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.messages['registrationPoint'],
    field: 'registrationPointName',
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.formatMessage({ id: 'registration.history.weight' }, { massUnit }),
    field: 'amount',
    customSort: (row1, row2) => unformat(row1.amount) - unformat(row2.amount),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.formatMessage({ id: 'registration.history.cost' }, { currency }),
    field: 'cost',
    customSort: (row1, row2) => unformat(row1.cost) - unformat(row2.cost),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: <FormattedHTMLMessage id='registration.history.co2' values={{ massUnit }} />,
    field: 'co2',
    customSort: (row1, row2) => unformat(row1.co2) - unformat(row2.co2),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.messages['report.sales_guests'],
    field: 'guestAmount',
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' },
    emptyValue: <Spinner size='small' />
  },
  {
    title: intl.messages['base.comments'],
    field: 'comment',
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  }
];

export const createExportConfig = (
  intl: InjectedIntl,
  { timeRange, massUnit }: { timeRange: TimeRange; massUnit: MassUnit }
) => ({
  fileName: `Foodwaste_registrations_${timeRange.from}_${timeRange.to}`,
  sheetName: 'Food waste registrations',
  render: (
    headers: Column<AdvancedFoodwasteReport>[],
    dataRow: AdvancedFoodwasteReport
  ): SheetFormat =>
    headers.reduce((all, header) => {
      const data = dataRow[header.field];

      if (data === undefined) {
        return all;
      }

      if (header.type === 'date') {
        return { ...all, [header.title as string]: moment(data).format('L') };
      }

      if (FormattedFields.has(header.field)) {
        // quick hack-fix
        let title = header.title;
        if (header.field === 'co2') {
          title = parseAsText(intl.formatMessage({ id: 'registration.history.co2' }, { massUnit }));
        }
        // todo: redo formatters; should be easy to extract display, raw and formatted values
        return { ...all, [title as string]: unformat(data) };
      }

      return { ...all, [header.title as string]: data };
    }, {} as { [title: string]: string | number })
});
