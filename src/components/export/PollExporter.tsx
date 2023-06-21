import React from 'react';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Alert } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import AverageValueResults from '../polling/AverageValueResults';
import PieChartResults from '../polling/PieChartResults';
import BarChartResults from '../polling/BarChartResults';
import WordCloudResults from '../polling/WordCloudResults';
import TopAnswersResults from '../polling/TopAnswersResults';
import ILecturePollingResults from '../../interfaces/ILecturePollingResults';

interface IPollExporterProps {
  slideNumber: number;
  results: ILecturePollingResults;
  currentUserId: number;
  isObserver: boolean;
}

interface IPollExporterState {}

export default class PollExporter extends SrUiComponent<
  IPollExporterProps,
  IPollExporterState
> {
  showResultsView() {
    const { results } = this.props;
    if (!results || !results.visualizationType) {
      return false;
    }

    return true;
  }

  getResultsView() {
    const { results } = this.props;

    switch (results.visualizationType) {
      case 'Average':
        return <AverageValueResults results={results} autoFit />;
      case 'Pie Chart':
        return <PieChartResults results={results} autoFit />;
      case 'Bar Chart':
        return <BarChartResults results={results} autoFit />;
      case 'Word Cloud':
        return <WordCloudResults results={results} autoFit />;
      case 'Top Answers':
        return <TopAnswersResults results={results} autoFit />;
      default:
        return (
          <Alert bsStyle="info">
            {Localizer.get(
              'There was no visualization for this polling question'
            )}
          </Alert>
        );
    }
  }

  performRender() {
    return <div>{this.renderPollInfo()}</div>;
  }

  renderPollInfo() {
    const { results, slideNumber, isObserver } = this.props;
    const totalSelections = Object.keys(results.numericResults || {})
      .map((k) => this.props.results.numericResults[k])
      .reduce((p, c) => p + c, 0);

    return (
      <div id="live-polling-view" className="poll-exporter">
        <h4>{Localizer.get('Polling results')}</h4>
        <div className="flex-grow-column-container">
          <p>
            <strong>{Localizer.get('Question')}</strong>
          </p>
          <p>{results.question}</p>
          {results.type === 'Single choice' ||
          results.type === 'Multiple choice' ? (
            <>
              <p className="margin margin-top-md">
                <strong>{Localizer.get('Choices')}</strong>
              </p>
              <table className="analytics-table polling-results">
                <thead>
                  <tr>
                    <th>{Localizer.get('Choice')}</th>
                    <th>{Localizer.get('Number of times chosen')}</th>
                    <th>{Localizer.get('% of total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {!isNull(results.numericResults) ? (
                    Object.keys(results.numericResults || {}).map((k, i) => {
                      return (
                        <tr
                          key={k + i}
                          className={
                            (results.correctAnswers || []).includes(k)
                              ? 'correct'
                              : ''
                          }
                        >
                          <td className="answer-choice">
                            <div className="d-flex align-items-center">
                              <p>{k}</p>
                              {(results.correctAnswers || []).includes(k) && (
                                <p className="label label-success ml-1">
                                  {Localizer.get('Correct answer')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td>{results.numericResults[k]}</td>
                          <td>
                            {totalSelections === 0
                              ? 0
                              : Math.round(
                                  100 *
                                    (results.numericResults[k] /
                                      totalSelections)
                                )}
                            %
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        {Localizer.get(
                          'Table will show after poll has at least one answer'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          ) : null}
          <p className="margin margin-top-md">
            <strong>{Localizer.get('Your answer')}</strong>
          </p>
          {isEmpty(results.userAnswers || []) && (
            <Alert bsStyle="warning">
              {Localizer.get("You didn't answer this question.")}
            </Alert>
          )}
          {(results.userAnswers || []).map((k, i) => {
            return (
              <div key={k + i} className="d-flex align-items-center">
                <p>{k}</p>
                {(results.correctAnswers || []).includes(k) && (
                  <p className="label label-success ml-1">
                    {Localizer.get('Correct answer')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
