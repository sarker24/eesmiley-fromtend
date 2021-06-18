import * as React from 'react';
import generatePDF, { GeneratePdfProps } from 'report/utils/generatePDF';
import debounce from 'lodash/debounce';
import { ChartImage } from 'report/utils/getChartPNG';

interface DownloadPDFProps<DATA, S = Omit<DATA, 'charts'>> {
  reportData: GeneratePdfProps<S>;
  generateChartPNG: () => Promise<ChartImage[][]>;
}

export function useDownloadReportPDF<DATA = unknown>(
  props: DownloadPDFProps<DATA>
): [boolean, () => void] {
  const { reportData, generateChartPNG } = props;
  const [isDownloading, setDownloading] = React.useState<boolean>(false);

  // cpu bound task, which affects rendering.
  // best case would be to offload this to web worker,
  // but it depends on canvas and web workers dont have access to dom.
  // Future option could be offscreenscanvas api, but its not supported by all browsers at the time of writing.
  // As a quickfix using debounce so that the isDownloading state has time to propagate in DOM.
  const debouncedGeneratePDF = debounce(async () => {
    const { data, Document, AsyncDocument, ...restData } = reportData;
    const chartsAsImages = await generateChartPNG();
    await generatePDF({
      AsyncDocument,
      Document,
      data: {
        ...data,
        charts: chartsAsImages
      },
      ...restData
    });
    setDownloading(false);
  }, 300);

  const downloadPDF = () => {
    if (!isDownloading) {
      setDownloading(true);
      void debouncedGeneratePDF();
    }
  };

  return [isDownloading, downloadPDF];
}
