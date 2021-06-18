import { InjectedIntl } from 'react-intl';
import { Column } from 'material-table';
import moment from 'moment';
import { MassUnit, unformat } from 'utils/number-format';
import { TimeRange } from 'redux/ducks/reports-new';
import { AdvancedReportSalesData } from 'redux/ducks/reportData/selector';
import { SheetFormat } from 'report/Advanced/utils/tableExport';

// cleaner would be to pass money / weight objects that can be unformatted
// by checking type
const FormattedFields = new Set([
  'foodwasteAmount',
  'foodwasteCost',
  'foodwasteCostPerGuest',
  'foodwasteAmountPerGuest',
  'foodwasteCostPerPortion',
  'foodwasteAmountPerPortion',
  'incomePerGuest',
  'incomePerPortion'
]);

export const createTableColumnConfig = (
  intl: InjectedIntl,
  { currency, massUnit }: { currency: string; massUnit: MassUnit }
): // eslint-disable-next-line @typescript-eslint/ban-types
Column<AdvancedReportSalesData>[] => [
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    title: (intl.messages['guest'] as any).other,
    field: 'guests',
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    title: (intl.messages['portion'] as any).other,
    field: 'portions',
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.formatMessage({ id: 'report.sales_income' }, { currency }),
    field: 'income',
    customSort: (row1, row2) => unformat(row1.income) - unformat(row2.income),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.formatMessage({ id: 'registration.history.cost' }, { currency }),
    field: 'foodwasteCost',
    customSort: (row1, row2) => unformat(row1.foodwasteCost) - unformat(row2.foodwasteCost),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: intl.formatMessage({ id: 'registration.history.weight' }, { massUnit }),
    field: 'foodwasteAmount',
    customSort: (row1, row2) => unformat(row1.foodwasteAmount) - unformat(row2.foodwasteAmount),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: `${intl.formatMessage({ id: 'registration.history.cost' }, { currency })}/${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
      (intl.messages['guest'] as any).one
    }`,
    field: 'foodwasteCostPerGuest',
    customSort: (row1, row2) =>
      unformat(row1.foodwasteCostPerGuest) - unformat(row2.foodwasteCostPerGuest),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: `${intl.formatMessage({ id: 'registration.history.weight' }, { massUnit })}/${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
      (intl.messages['guest'] as any).one
    }`,
    field: 'foodwasteAmountPerGuest',
    customSort: (row1, row2) =>
      unformat(row1.foodwasteAmountPerGuest) - unformat(row2.foodwasteAmountPerGuest),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: `${intl.formatMessage({ id: 'registration.history.cost' }, { currency })}/${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
      (intl.messages['portion'] as any).one
    }`,
    field: 'foodwasteCostPerPortion',
    customSort: (row1, row2) =>
      unformat(row1.foodwasteCostPerPortion) - unformat(row2.foodwasteCostPerPortion),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: `${intl.formatMessage({ id: 'registration.history.weight' }, { massUnit })}/${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
      (intl.messages['portion'] as any).one
    }`,
    field: 'foodwasteAmountPerPortion',
    customSort: (row1, row2) =>
      unformat(row1.foodwasteAmountPerPortion) - unformat(row2.foodwasteAmountPerPortion),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: `${intl.formatMessage({ id: 'report.sales_income' }, { currency })}/${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
      (intl.messages['guest'] as any).one
    }`,
    field: 'incomePerGuest',
    customSort: (row1, row2) => unformat(row1.incomePerGuest) - unformat(row2.incomePerGuest),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  },
  {
    title: `${intl.formatMessage({ id: 'report.sales_income' }, { currency })}/${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
      (intl.messages['portion'] as any).one
    }`,
    field: 'incomePerPortion',
    customSort: (row1, row2) => unformat(row1.incomePerPortion) - unformat(row2.incomePerPortion),
    cellStyle: { borderColor: 'rgba(0, 0, 0, 0.05)' }
  }
];

export const createExportConfig = (
  intl: InjectedIntl,
  { timeRange }: { timeRange: TimeRange }
) => ({
  fileName: `sales_registrations_${timeRange.from}_${timeRange.to}`,
  sheetName: 'Sales registrations',
  render: (
    headers: Column<AdvancedReportSalesData>[],
    dataRow: AdvancedReportSalesData
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
        return { ...all, [header.title as string]: unformat(data) };
      }

      return { ...all, [header.title as string]: data };
    }, {} as { [title: string]: number | string })
});
