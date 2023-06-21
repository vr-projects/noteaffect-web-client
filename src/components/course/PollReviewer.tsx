import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isObject from 'lodash/isObject';
import isUndefined from 'lodash/isUndefined';
import has from 'lodash/has';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
  SrAppMessage,
} from 'react-strontium';
import {
  GENERAL_COMPONENT,
  POLL_REVIEWER_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ILecture from '../../models/ILecture';
import AverageValueResults from '../polling/AverageValueResults';
import PieChartResults from '../polling/PieChartResults';
import BarChartResults from '../polling/BarChartResults';
import WordCloudResults from '../polling/WordCloudResults';
import TopAnswersResults from '../polling/TopAnswersResults';
import ILecturePollingResults from '../../interfaces/ILecturePollingResults';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IConnectedPollReviewerProps extends DispatchProp<any> {}

interface IPollReviewerProps {
  lecture: ILecture;
  selectedSlideNumber: number;
  observerOnly: boolean;
}

interface IPollReviewerState {
  loading: LoadStates;
  results: ILecturePollingResults;
}

enum VISUALIZATION_TYPE {
  AVERAGE = 'Average',
  PIE_CHART = 'Pie Chart',
  BAR_CHART = 'Bar Chart',
  WORD_CLOUD = 'Word Cloud',
  TOP_ANSWERS = 'Top Answers',
}
class PollReviewer extends SrUiComponent<
  IConnectedPollReviewerProps & IPollReviewerProps,
  IPollReviewerState
> {
  initialState(): IPollReviewerState {
    return { loading: LoadStates.Unloaded, results: null };
  }

  getHandles() {
    return [AppBroadcastEvents.LectureUpdated];
  }

  onAppMessage(msg: SrAppMessage) {
    if (
      msg.action === AppBroadcastEvents.LectureUpdated &&
      msg.data.lectureId === this.props.lecture.id &&
      this.mounted()
    ) {
      this.loadPollInfo(this.props);
    }
  }

  onComponentMounted() {
    this.loadPollInfo(this.props);
  }

  async loadPollInfo(props: IPollReviewerProps) {
    const { lecture: prevLecture, observerOnly } = this.props;
    const { lecture, selectedSlideNumber } = props;

    if (!prevLecture.ended) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    try {
      const pollResp = await ApiHelpers.read(
        `lectures/${lecture.id}/slides/${selectedSlideNumber}/poll`
      );

      let pollInfo: ILecturePollingResults = null;
      if (pollResp.good && !isNull(pollResp.data) && pollResp.data !== '') {
        pollInfo = JSON.parse(pollResp.data) as ILecturePollingResults;
      }

      if (this.mounted()) {
        if (
          pollInfo &&
          !observerOnly &&
          !pollInfo.answeredByUser &&
          !!pollInfo.unansweredQuestionDetails
        ) {
          this.props.dispatch(
            PresentationActions.receivedPostQuestion(
              pollInfo.unansweredQuestionDetails
            )
          );
        }

        this.set({ results: pollInfo, loading: LoadStates.Succeeded });
      }
    } catch (error) {
      console.error(error);
      this.setPartial({
        loading: LoadStates.Failed,
      });
    }
  }

  onNewProps(props: IPollReviewerProps) {
    const {
      lecture: prevLecture,
      selectedSlideNumber: prevSelectedSlideNumber,
    } = this.props;
    const { lecture, selectedSlideNumber } = props;

    if (
      prevLecture !== lecture ||
      prevSelectedSlideNumber !== selectedSlideNumber
    ) {
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
      case VISUALIZATION_TYPE.AVERAGE:
        return <AverageValueResults results={results} autoFit />;
      case VISUALIZATION_TYPE.PIE_CHART:
        return <PieChartResults results={results} autoFit />;
      case VISUALIZATION_TYPE.BAR_CHART:
        return <BarChartResults results={results} autoFit />;
      case VISUALIZATION_TYPE.WORD_CLOUD:
        return <WordCloudResults results={results} autoFit />;
      case VISUALIZATION_TYPE.TOP_ANSWERS:
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

  getTotalSelections(results) {
    if (
      isUndefined(results) ||
      isNull(results) ||
      !has(results, 'numericResults')
    ) {
      return 0;
    }
    return Object.keys(results.numericResults || {})
      .map((key) => results.numericResults[key])
      .reduce((acc, curr) => acc + curr, 0);
  }

  performRender() {
    const { selectedSlideNumber, lecture, observerOnly } = this.props;
    const { loading, results } = this.state;
    const totalSelections = this.getTotalSelections(results);

    return (
      <div className="poll-reviewer mb-4">
        <h4>
          {Localizer.getFormatted(GENERAL_COMPONENT.POLL_SEGMENT)}{' '}
          {selectedSlideNumber}
        </h4>
        {!lecture.ended && (
          <Alert bsStyle="warning">
            {Localizer.getFormatted(POLL_REVIEWER_COMPONENT.NOT_ENDED)}
          </Alert>
        )}
        <LoadIndicator
          state={loading}
          loadingMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.LOADING_SEGMENT_POLL
          )}
        />

        {loading === LoadStates.Succeeded && (
          <>
            {isNull(results) && (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.NO_POLL_QUESTION_SEGMENT
                )}
              </Alert>
            )}

            {!observerOnly &&
              !isNull(results) &&
              has(results, 'answeredByUser') &&
              !results.answeredByUser && (
                <Alert bsStyle="warning">
                  {Localizer.get(
                    "You'll be able to see all polling results after you answer the poll."
                  )}
                </Alert>
              )}
            {!isNull(results) &&
              isObject(results) &&
              has(results, 'numericResults') && (
                <div
                  id="live-polling-view"
                  className="poll-reviewer-poll-info d-flex flex-wrap"
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
                            {Object.keys(results.numericResults || {}).map(
                              (k, i) => {
                                return (
                                  <tr
                                    key={k + i}
                                    className={
                                      (results.correctAnswers || []).indexOf(
                                        k
                                      ) !== -1
                                        ? 'correct'
                                        : ''
                                    }
                                  >
                                    <td className="answer-choice">
                                      <p>{k}</p>
                                      {(results.correctAnswers || []).indexOf(
                                        k
                                      ) !== -1 ? (
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
                                              (results.numericResults[k] /
                                                totalSelections)
                                          )}
                                      %
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </>
                    ) : null}
                    {!observerOnly && (
                      <>
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
                            <div key={k + i}>
                              <p>{k}</p>
                              {(results.correctAnswers || []).indexOf(k) !==
                                -1 && (
                                <p className="label label-success">
                                  {Localizer.get('Correct answer')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                  {this.showResultsView() && (
                    <div className="flex-grow w-100">
                      <h4>
                        {Localizer.getFormatted(
                          GENERAL_COMPONENT.POLL_VISUALIZATION_SEGMENT
                        )}{' '}
                        {selectedSlideNumber}
                      </h4>
                      {this.getResultsView()}
                    </div>
                  )}
                </div>
              )}
          </>
        )}
      </div>
    );
  }
}

export default connect<IConnectedPollReviewerProps, void, IPollReviewerProps>(
  () => {
    return {};
  }
)(PollReviewer);
