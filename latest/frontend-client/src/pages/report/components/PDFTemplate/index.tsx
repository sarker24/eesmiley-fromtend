import ReactPDF, { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import * as React from 'react';
import theme from 'styles/themes/reports';
import { pxToPt } from 'utils/typography';
import logo from 'static/img/esmiley-logo.png';

// Disables default hyphenation logic from react-pdf
const hyphenationCallback = (word: string): string[] => {
  return [word];
};

Font.registerHyphenationCallback(hyphenationCallback);
Font.register({
  family: 'Lato',
  fonts: [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      src: require('static/fonts/Lato-Regular.ttf'),
      fontWeight: 400
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      src: require('static/fonts/Lato-Bold.ttf'),
      fontWeight: 700
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      src: require('static/fonts/Lato-Black.ttf'),
      fontWeight: 900
    }
  ]
});

const PDFTemplate: React.FunctionComponent = (props) => {
  return (
    <Document>
      <Page style={styles.page} size='A4'>
        <View style={styles.logoContainer} fixed>
          <Image src={logo} style={styles.logo} />
        </View>
        {props.children}
        <Text
          style={styles.pageIndicator}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

const styles: ReactPDF.Styles = StyleSheet.create({
  page: {
    padding: `0 ${pxToPt(138)}pt ${pxToPt(138)}pt ${pxToPt(138)}pt`,
    fontFamily: 'Lato',
    color: theme.palette.text.primary
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  logo: {
    marginTop: pxToPt(94),
    marginBottom: pxToPt(52),
    width: pxToPt(342)
  },
  pageIndicator: {
    fontSize: pxToPt(40),
    color: theme.palette.grey[400],
    position: 'absolute',
    bottom: pxToPt(70),
    right: pxToPt(90)
  },
  section: {
    fontFamily: 'Lato',
    paddingBottom: 20
  },
  title: {
    fontSize: pxToPt(80),
    fontWeight: 900,
    marginBottom: 5
  },
  subTitle: {
    fontSize: pxToPt(40),
    lineHeight: 1.38,
    color: theme.palette.text.secondary
  },
  bold: {
    fontWeight: 900
  },
  facts: {
    backgroundColor: '#fafafa',
    borderTop: '1pt solid #d9d9d9',
    borderBottom: '1pt solid #d9d9d9',
    padding: 14.4
  },
  factWrapper: {
    backgroundColor: theme.palette.common.white,
    borderRadius: pxToPt(2),
    padding: `${pxToPt(40)}pt ${pxToPt(50)}pt`,
    border: '1pt solid #f0f0f0',
    display: 'flex',
    flexGrow: 1
  },
  groupHeadline: {
    color: theme.palette.text.primary,
    fontSize: pxToPt(54),
    fontWeight: 900,
    marginBottom: 20,
    marginLeft: 5
  },
  factsContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  fact: {
    textAlign: 'center',
    padding: `0 ${pxToPt(40)}pt`,
    display: 'flex',
    flexGrow: 1
  },
  factHeadline: {
    fontWeight: 900,
    fontSize: pxToPt(54),
    marginBottom: pxToPt(60),
    flexGrow: 1,
    flexShrink: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    flexBasis: 'auto'
  },
  factIcon: {
    maxWidth: pxToPt(130),
    maxHeight: pxToPt(104),
    display: 'flex',
    alignSelf: 'center',
    margin: `${pxToPt(70)}pt 0 ${pxToPt(30)}pt`
  },
  sectionText: {
    paddingTop: 20
  },
  sectionTitle: {
    fontSize: pxToPt(54),
    fontWeight: 900,
    marginBottom: 5,
    color: theme.palette.text.primary
  },
  sectionSubTitle: {
    fontSize: pxToPt(40),
    lineHeight: 1.38,
    color: theme.palette.text.secondary
  },
  chartContainer: {
    marginTop: 50
  },
  barHeaderText: {
    fontSize: pxToPt(40),
    fontWeight: 900,
    color: theme.palette.text.secondary,
    flex: 1
  },
  barHeaderValue: {
    fontSize: pxToPt(40),
    fontWeight: 900,
    color: theme.palette.text.secondary
  },
  barHeader: {
    borderBottomWidth: '1.2pt',
    borderBottomStyle: 'solid',
    paddingLeft: '6px',
    paddingRight: '6px',
    paddingBottom: '1px',
    marginBottom: '10pt',
    display: 'flex',
    flexDirection: 'row'
  },
  barChart: {
    width: '33.33%',
    padding: '0 15pt 50pt'
  },
  barChartsContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '50pt',
    fontFamily: 'Lato'
  },
  halfWidth: {
    width: '50%',
    display: 'flex'
  },
  amount: {
    fontSize: pxToPt(80),
    color: theme.palette.text.primary,
    fontWeight: 900,
    marginTop: pxToPt(30),
    marginBottom: pxToPt(30)
  },
  progress: {
    fontSize: pxToPt(40),
    color: theme.palette.text.secondary,
    fontWeight: 900,
    textAlign: 'center'
  },
  progressText: {
    color: theme.palette.grey[400],
    fontWeight: 400
  },
  progressArrow: {
    // pngs
    width: pxToPt(35),
    height: pxToPt(40)
  },
  divider: {
    borderTop: '1pt solid #f0f0f0'
  },
  progressBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: pxToPt(40),
    padding: pxToPt(10)
  },
  progressBoxText: {
    color: theme.palette.text.secondary,
    fontWeight: 400
  },
  progressNegative: {
    backgroundColor: theme.palette.error.light
  },
  progressPositive: {
    backgroundColor: theme.palette.success.light
  },
  progressNeutral: {
    backgroundColor: theme.palette.grey.A700
  },
  progressPositiveIcon: {
    color: theme.palette.success.main
  },
  progressNegativeIcon: {
    color: theme.palette.error.main
  },
  progressIcon: {
    // svgs
    width: 15,
    height: 15,
    marginRight: pxToPt(6)
  },
  metricList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
});

export { styles };
export default PDFTemplate;
