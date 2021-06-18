import * as React from 'react';
import { saveAs } from 'file-saver';
import { Basis, Dimension } from 'redux/ducks/reports-new';

const asyncPdf = () => import('@react-pdf/renderer').then((module) => module.pdf);

export type PdfProps<Data> = {
  data: Data;
  basis?: Basis;
  dimension?: Dimension;
};

export interface GeneratePdfProps<Data = unknown> {
  AsyncDocument?: () => Promise<React.ComponentType<PdfProps<Data>>>;
  Document?: React.ComponentType<PdfProps<Data>>;
  data: Data;
  basis?: Basis;
  dimension?: Dimension;
  name: string;
}

const generatePDF = async ({
  Document,
  AsyncDocument,
  data,
  basis,
  dimension,
  name
}: GeneratePdfProps): Promise<void> => {
  const Template = Document || (await AsyncDocument());
  const pdf = await asyncPdf();
  const blob = await pdf(<Template data={data} basis={basis} dimension={dimension} />).toBlob();
  // not sure why typings are not working with saveAs
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
  return saveAs(blob, name + '.pdf');
};

// generate limited string of array to avoid breaking layouts (accounts, registration points lists)
type GenerateListOptions = {
  limit?: number;
  separator?: string;
};

const generateListString = (list: unknown[], options: GenerateListOptions = {}): string => {
  const { limit = 6, separator = ', ' } = options;
  const suffix = list.length > 6 ? '... ' : '';
  return list.slice(0, limit).join(separator) + suffix;
};

export default generatePDF;
export { generateListString };
