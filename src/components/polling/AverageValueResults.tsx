import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import IPollingResults from '../../interfaces/IPollingResults';

interface IAverageValueResultsProps {
  results: IPollingResults;
  autoFit?: boolean;
}

interface IAverageValueResultsState {}

export default class AverageValueResults extends SrUiComponent<
  IAverageValueResultsProps,
  IAverageValueResultsState
> {
  resizeCallback() {
    return () => {
      this.updateChartSize();
    };
  }

  onComponentMounted() {
    this.updateChartSize();
  }

  // TODO tech debt explore if this is necessary vs. using CSS
  updateChartSize() {
    if (this.props.autoFit === true) {
      return;
    }

    const container = this.getRef<HTMLDivElement>('average-results');
    const content = this.getRef<HTMLDivElement>('average-results-content');

    if (!container || !content) {
      return;
    }

    let headerHeight = 0;
    const headerElement = document.getElementsByTagName('h1')[0];
    if (headerElement) {
      headerHeight = headerElement.clientHeight;
    }

    const height = window.innerHeight - 20 - headerHeight;
    const width = window.innerWidth - 20;
    const contentHeight = content.clientHeight;
    const contentWidth = content.clientWidth;
    content.style.top = `${(height - contentHeight) / 2 - 40}px`;
    content.style.left = `${(width - contentWidth) / 2}px`;
  }

  performRender() {
    const { results } = this.props;

    return (
      <div className="average-value-results" ref="average-results">
        <div className="average-results-content" ref="average-results-content">
          <div className="average text-center">
            {results.average.toFixed(1)}
          </div>
          <div className="out-of text-center">Of {results.maxValue}</div>
        </div>
      </div>
    );
  }
}
