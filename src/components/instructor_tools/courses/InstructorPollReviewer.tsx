import * as React from 'react';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
  SrAppMessage,
} from 'react-strontium';
import ILecture from '../../../models/ILecture';
import ILecturePollingResults from '../../../interfaces/ILecturePollingResults';
import { GENERAL_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import AverageValueResults from '../../polling/AverageValueResults';
import PieChartResults from '../../polling/PieChartResults';
import BarChartResults from '../../polling/BarChartResults';
import WordCloudResults from '../../polling/WordCloudResults';
import TopAnswersResults from '../../polling/TopAnswersResults';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';

interface IInstructorPollReviewerProps {
  lecture: ILecture;
  selectedSlideNumber: number;
}

interface IInstructorPollReviewerState {
  loading: LoadStates;
  results: ILecturePollingResults;
}

export default class InstructorPollReviewer extends SrUiComponent<
  IInstructorPollReviewerProps,
  IInstructorPollReviewerState
> {
  initialState(): IInstructorPollReviewerState {
    return { loading: LoadStates.Unloaded, results: null };
  }

  getHandles() {
    return [AppBroadcastEvents.LivePollingUpdated];
  }

  onAppMessage(msg: SrAppMessage) {
    if (
      msg.action === AppBroadcastEvents.LivePollingUpdated &&
      msg.data.seriesId === this.props.lecture.seriesId &&
      msg.data.lectureId === this.props.lecture.id &&
      msg.data.slide === this.props.selectedSlideNumber
    ) {
      this.deferred(
        () => {
          this.setPartial({ results: null });
          this.loadPollInfo(this.props);
        },
        500,
        'updatePollingInfo'
      );
    }
  }

  onComponentMounted() {
    this.loadPollInfo(this.props);
  }

  async loadPollInfo(props: IInstructorPollReviewerProps) {
    this.setPartial({ loading: LoadStates.Loading });
    const pollResp = await ApiHelpers.read(
      `lectures/${props.lecture.id}/slides/${props.selectedSlideNumber}/poll`
    );

    let pollInfo: ILecturePollingResults = null;
    if (pollResp.good && pollResp.data !== null && pollResp.data !== '') {
      pollInfo = JSON.parse(pollResp.data) as ILecturePollingResults;
    }

    if (this.mounted()) {
      this.set({ results: pollInfo, loading: LoadStates.Succeeded });
    }
  }

  onNewProps(props: IInstructorPollReviewerProps) {
    const { lecture, selectedSlideNumber } = props;
    const {
      lecture: prevLecture,
      selectedSlideNumber: prevSelectedSlideNumber,
    } = this.props;
    if (
      prevLecture !== lecture ||
      prevSelectedSlideNumber !== selectedSlideNumber
    ) {
      this.cancelDeferred('updatePollingInfo');
      this.setPartial({ results: null });
      this.loadPollInfo(props);
    }
  }

  showResultsView() {
    const { results } = this.state;
    if (!results || !results.visualizationType) {
      return false;
    }

    return true;
  }

  getResultsView() {
    const { results } = this.state;
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

  renderPollInfo() {
    const { selectedSlideNumber } = this.props;
    const { results } = this.state;
    if (!results) {
      return null;
    }

    const totalSelections = Object.keys(results.numericResults || {})
      .map((k) => results.numericResults[k])
      .reduce((p, c) => p + c, 0);

    return (
      <div
        id="live-polling-view"
        className="instructor-poll-reviewer d-flex flex-wrap mb-4"
      >
        <div className="flex-grow w-100">
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
                  {Object.keys(results.numericResults || {}).map((k, i) => {
                    return (
                      <tr
                        key={k + i}
                        className={
                          results.correctAnswers.indexOf(k) !== -1
                            ? 'correct'
                            : ''
                        }
                      >
                        <td className="answer-choice">
                          <p>{k}</p>
                          {results.correctAnswers.indexOf(k) !== -1 ? (
                            <p className="label label-success">
                              {Localizer.get('Correct answer')}
                            </p>
                          ) : null}
                        </td>
                        <td>{results.numericResults[k]}</td>
                        <td>
                          {totalSelections === 0
                            ? 0
                            : Math.round(
                                100 *
                                  (results.numericResults[k] / totalSelections)
                              )}
                          %
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : null}
        </div>
        {this.showResultsView() ? (
          <div className="flex-grow w-100">
            <h4>
              {Localizer.getFormatted(
                GENERAL_COMPONENT.POLL_VISUALIZATION_SEGMENT
              )}{' '}
              {selectedSlideNumber}
            </h4>
            {this.getResultsView()}
          </div>
        ) : null}
      </div>
    );
  }

  performRender() {
    const { selectedSlideNumber } = this.props;
    const { loading, results } = this.state;

    return (
      <div>
        <h4>
          {Localizer.getFormatted(GENERAL_COMPONENT.POLL_SEGMENT)}{' '}
          {selectedSlideNumber}
        </h4>
        <LoadIndicator
          state={loading}
          loadingMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.LOADING_SEGMENT_POLL
          )}
        />
        {loading === LoadStates.Succeeded && !results ? (
          <Alert bsStyle="info">
            {Localizer.getFormatted(GENERAL_COMPONENT.NO_POLL_QUESTION_SEGMENT)}
          </Alert>
        ) : (
          this.renderPollInfo()
        )}
      </div>
    );
  }
}
