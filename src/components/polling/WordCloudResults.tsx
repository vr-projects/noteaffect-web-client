import * as React from 'react';
import hash from 'string-hash';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { SrUiComponent } from 'react-strontium';
import IPollingResults from '../../interfaces/IPollingResults';

interface IWordCloudResultsProps {
  results: IPollingResults;
  autoFit?: boolean;
}

interface IWordCloudResultsState {}

export default class WordCloudResults extends SrUiComponent<
  IWordCloudResultsProps,
  IWordCloudResultsState
> {
  private _canvasRef: HTMLCanvasElement;
  private _lastWordHash: number;

  // TODO tech debt this may need CSS solution
  resizeCallback() {
    return () => {
      this.setChartSize();
      this.updateCloud(this.props.results, false);
    };
  }

  onNewProps(props: { results: IPollingResults }) {
    this.updateCloud(props.results);
  }

  renderCloud(ref: HTMLCanvasElement) {
    if (this._canvasRef || !ref) {
      return;
    }

    this._canvasRef = ref;
    this.setChartSize();

    this.updateCloud(this.props.results);
  }

  updateCloud(results: IPollingResults, checkHash: boolean = true) {
    if (!results || !this._canvasRef) {
      return;
    }

    const referenceWidth = 500.0;
    const referenceMax = 100.0;
    const words = this.getWords(results.wordResults);

    const currentHash = this.getWordHash(words);
    if (checkHash && currentHash === this._lastWordHash) {
      return;
    }
    this._lastWordHash = currentHash;
    const normalizedWidth = this._canvasRef.width / 2 / referenceWidth;
    const actualMax = Math.max(...words.map((w) => w[1]));
    const maxNormalizeFactor = (referenceMax / actualMax) * normalizedWidth;

    (window as any).WordCloud(this._canvasRef, {
      gridSize: 11 * normalizedWidth,
      weightFactor: (size) => {
        return Math.max(size * maxNormalizeFactor, 10);
      },
      fontFamily: 'Times, serif',
      rotateRatio: 0.5,
      rotationSteps: 2,
      list: words,
    });
  }

  // TODO tech debt confirm works
  getWords(newWords: { [word: string]: number }) {
    if (isNull(newWords) || isUndefined(newWords)) return ['no words', 5];

    const words = [];
    Object.keys(newWords).forEach((k) => words.push([k, newWords[k] * 5]));
    words.sort((a, b) => b[1] - a[1]);

    return words;
  }

  getWordHash(words: any[]) {
    return hash(JSON.stringify(words));
  }

  setChartSize() {
    if (!this._canvasRef) {
      return;
    }

    if (this.props.autoFit === true) {
      return;
    }

    let headerHeight = 0;
    const headerElement = document.getElementsByTagName('h1')[0];
    if (headerElement) {
      headerHeight = headerElement.clientHeight;
    }

    const width = window.innerWidth - 20;
    const height = window.innerHeight - 20 - headerHeight;
    this._canvasRef.style.width = `${width}px`;
    this._canvasRef.width = width * 2;
    this._canvasRef.style.height = `${height}px`;
    this._canvasRef.height = height * 2;
  }

  performRender() {
    return (
      <div className="word-cloud-results">
        <canvas
          id="live-cloud-view"
          className="live-cloud-results text-center"
          ref={(r) => this.renderCloud(r)}
        />
      </div>
    );
  }
}
