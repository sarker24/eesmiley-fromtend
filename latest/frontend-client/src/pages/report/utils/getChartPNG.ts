import { addLatoFontToSVG, transformSVGStringToImage } from 'utils/svg';
import { ChartRefs } from 'redux/ducks/charts';
import Highcharts, { Chart } from 'highcharts';

interface TransformProps<MetaData> {
  chartRefs: ChartRefs;
  type: 'donut' | 'bar' | 'barGroup' | 'line' | 'column';
  imageWidth?: number;
  sourceWidth: number;
  maxHeight?: number;
  metadataGen?: (chart: Chart) => MetaData;
  options?: Highcharts.Options;
}

export interface ChartImage<MetaData = unknown> {
  dataURL: string[];
  metadata?: MetaData;
}

const A4WidthAt300DPI = 2480;

const getChartPNG = <MetaData = unknown>(
  props: TransformProps<MetaData>
): Promise<ChartImage<MetaData>[] | undefined> => {
  const {
    chartRefs,
    type,
    sourceWidth,
    imageWidth = A4WidthAt300DPI,
    maxHeight,
    metadataGen,
    options
  } = props;

  if (!chartRefs[type]) {
    return Promise.resolve(undefined) as Promise<undefined>;
  }

  /**
   * These new sizes above are needed in order to export the SVG of the chart in a higher resolution,
   * so that it's nice and crisp inside the PDF.
   *
   * The heightInPDF is calculated (rule of 3, below) in order to preserve the aspect ratio of the chart.
   * Rule of 3:
   * sourceWidth of Image ---- sourceHeight of Image
   * scaledWidth of Image  ---- X (scaledHeight of Image)
   *
   * A custom sourceWidth is chosen for the image in order for all labels and other needed data to be visible.
   * This is chosen by eye - a size where the chart looks acceptable on the page.
   * Note that the chartWidth property can't be used, because the property changes based on the screen size,
   * so on small screens, you will end up getting cropped labels, which will be exported to the SVG.
   *
   **/

  return Promise.all<ChartImage<MetaData>>(
    chartRefs[type].flatMap((chart: Chart) => {
      const sourceHeight = chart.chartHeight;
      const imageHeight = (imageWidth / sourceWidth) * sourceHeight;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      let chartSVG = chart.getSVG({
        exporting: {
          sourceWidth: sourceWidth,
          sourceHeight: sourceHeight
        },
        ...options
      });

      chartSVG = addLatoFontToSVG(chartSVG);

      return transformSVGStringToImage({
        svgString: chartSVG,
        width: imageWidth,
        height: imageHeight,
        maxHeight,
        format: 'png'
      }).then((dataURL) => (metadataGen ? { metadata: metadataGen(chart), dataURL } : { dataURL }));
    })
  );
};

export default getChartPNG;
