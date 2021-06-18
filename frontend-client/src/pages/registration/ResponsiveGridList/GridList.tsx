import { GridList as MuiGridList } from '@material-ui/core';
import PaginatedSwipeableViews from '../PaginatedSwipeableViews';
import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withContentRect } from 'react-measure';
import { compose } from 'redux';

interface IComponentProps {
  classes: { [name: string]: string };
  contentRect: { bounds: { width: number; height: number } };
  measureRef: React.RefObject<HTMLDivElement>;
  width: number;
  children: React.ReactElement[];
}

class GridList extends React.Component<IComponentProps> {
  render() {
    const { classes, children, contentRect, measureRef } = this.props;

    const spacingSize = window.innerWidth < 1024 ? 16 : 24;
    // width has -6 margins
    const containerWidth = contentRect.bounds.width + spacingSize;
    // space for the stepper
    const containerHeight = contentRect.bounds.height;
    // mount the container without children because
    // we can only get the measurement after the initial mount
    if (isNaN(containerWidth)) {
      return <div ref={measureRef} className={classes.container} />;
    }

    const minCellSize = 120;
    const maxCols = Math.floor(containerWidth / (spacingSize + minCellSize));
    const maxRows = Math.floor(containerHeight / (spacingSize + minCellSize));
    const perPage = maxCols * maxRows;
    const numberOfPages = Math.floor(React.Children.count(children) / perPage);

    const pages = [];
    for (let i = 0; i <= numberOfPages; i++) {
      const pageStart = i * perPage;
      const pageEnd = (i + 1) * perPage;
      const pageContent = React.Children.toArray(children).slice(pageStart, pageEnd);
      const childrenCount = pageContent.length;

      if (childrenCount !== 0) {
        let optimalRows: number;
        let optimalCols: number;

        // responsiveness
        if (childrenCount < perPage) {
          const rowsPerColumns = containerHeight / containerWidth;
          optimalCols = Math.ceil(Math.sqrt(childrenCount / rowsPerColumns));
          optimalRows = Math.ceil(childrenCount / optimalCols);
        } else {
          optimalRows = maxRows;
          optimalCols = maxCols;
        }

        const optimalCellWidth = containerWidth / optimalCols;
        const optimalCellHeight = containerHeight / optimalRows - spacingSize;
        const optimalCellSize =
          optimalCellHeight < optimalCellWidth ? optimalCellHeight : optimalCellWidth;

        pages.push(
          <MuiGridList
            cellHeight={optimalCellSize}
            cols={optimalCols}
            spacing={spacingSize}
            key={`slide__${i}`}
            style={{ overflowY: 'visible' }}
          >
            {pageContent}
          </MuiGridList>
        );
      }
    }

    return (
      <div ref={measureRef} className={classes.container}>
        <PaginatedSwipeableViews>{pages}</PaginatedSwipeableViews>
      </div>
    );
  }
}

const styles = {
  container: {
    width: 'auto',
    height: '100%'
  }
};

//  eslint-disable-next-line
export default compose<any>(withStyles(styles), withContentRect('bounds'))(GridList);
