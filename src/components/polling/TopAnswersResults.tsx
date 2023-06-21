import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import IPollingResults from '../../interfaces/IPollingResults';

interface ITopAnswersResultsProps {
  results: IPollingResults;
  autoFit?: boolean;
}
interface ITopAnswersResultsState {}

export default class TopAnswersResults extends SrUiComponent<
  ITopAnswersResultsProps,
  ITopAnswersResultsState
> {
  // TODO confirm if this is ever used
  performRender() {
    return <div className="live-top-answers-results">top results</div>;
  }
}
