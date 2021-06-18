import { saveAs } from 'file-saver';
import moment from 'moment';
import { Column } from 'material-table';

// xlsx is huge dependency, 1.4 mb
const asyncXLSX = async () => import('xlsx');

export type ExportExtension = 'xlsx' | 'csv';

export type SheetFormat = {
  [title: string]: number | string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ExportOptions<T extends object> {
  render?: (headers: Column<T>[], dataRow: T) => SheetFormat;
  fileName?: string;
  sheetName?: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
interface ExportTableProps<T extends object> {
  ext: ExportExtension;
  data: T[];
  headers: Column<T>[];
  options: ExportOptions<T>;
}

// default renders all string/number fields
// eslint-disable-next-line @typescript-eslint/ban-types
function defaultRender<T extends object & { [key: string]: any }>(
  headers: Column<T>[],
  dataRow: T
): SheetFormat {
  return headers.reduce((all, header) => {
    const data = dataRow[header.field];

    if (data === undefined) {
      return all;
    }

    if (typeof data !== 'number' || typeof data !== 'string') {
      return all;
    }

    if (header.type === 'date') {
      return { ...all, [header.title as string]: moment(data).format('L') };
    }

    return { ...all, [header.title as string]: data };
  }, {} as SheetFormat);
}

function getColWidths(dataRows: SheetFormat[], padding = 4): { wch: number }[] {
  if (dataRows.length === 0) {
    return [];
  }

  const keys = Object.keys(dataRows[0]).reduce(
    (all, key) => ({
      ...all,
      [key]: key.length
    }),
    {} as { [key: string]: number }
  );
  dataRows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (String(row[key]).length > keys[key]) {
        keys[key] = String(row[key]).length;
      }
    });
  });

  return Object.keys(keys).map((key) => ({ wch: keys[key] + padding }));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function exportTable<T extends object>(props: ExportTableProps<T>) {
  const {
    ext,
    headers,
    data,
    options: { render = defaultRender, fileName, sheetName }
  } = props;
  void asyncXLSX().then((xlsx) => {
    const formattedData = data.map((dataRow) => render(headers, dataRow));
    const sheet = xlsx.utils.json_to_sheet(formattedData);
    const workbook = xlsx.utils.book_new();
    const colWidth = getColWidths(formattedData);
    xlsx.utils.book_append_sheet(workbook, { '!cols': colWidth, ...sheet }, sheetName);
    const arrayBuf = xlsx.write(workbook, { type: 'array', bookType: ext }) as ArrayBuffer;
    const sheetBlob = new Blob([arrayBuf], { type: ext });
    saveAs(sheetBlob, `${fileName}.${ext}`);
  });
}
