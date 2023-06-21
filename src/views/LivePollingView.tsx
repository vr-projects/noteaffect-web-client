import * as React from 'react';
import has from 'lodash/has';
import { SrUiComponent, ApiHelpers, WaitSpinner } from 'react-strontium';
import ILocalQuestionData from '../interfaces/ILocalQuestionData';
import IPollingResults from '../interfaces/IPollingResults';
import TopAnswersResults from '../components/polling/TopAnswersResults';
import WordCloudResults from '../components/polling/WordCloudResults';
import BarChartResults from '../components/polling/BarChartResults';
import PieChartResults from '../components/polling/PieChartResults';
import AverageValueResults from '../components/polling/AverageValueResults';

enum VISUALIZATION_TYPES {
  AVERAGE = 'Average',
  PIE_CHART = 'Pie Chart',
  BAR_CHART = 'Bar Chart',
  WORD_CLOUD = 'Word Cloud',
  TOP_ANSWERS = 'Top Answers',
}

interface ILivePollingViewProps {
  seriesId: string;
  lectureId: string;
  application: string;
  context: string;
  questionData?: string;
}

interface ILivePollingViewState {
  localData: ILocalQuestionData;
  results: IPollingResults;
}

export default class LivePollingView extends SrUiComponent<
  ILivePollingViewProps,
  ILivePollingViewState
> {
  initialState() {
    return { localData: undefined, results: undefined };
  }

  onComponentMounted() {
    this.getQuestionInfo();
  }

  async getQuestionInfo() {
    const {
      seriesId,
      lectureId,
      application,
      context,
      questionData = '',
    } = this.props;
    if (seriesId && lectureId && application && context) {
      await this.setPartialAsync({
        localData: {
          status: 'ok',
          lectureId: parseInt(lectureId),
          seriesId: parseInt(seriesId),
          application: application,
          context: context,
          questionData: questionData,
        },
      });
      this.startResultsPolling();
    } else {
      const apiResp = await ApiHelpers.readFrom('local', '');
      if (apiResp.good) {
        const questionData = JSON.parse(apiResp.data) as ILocalQuestionData;
        await this.setPartialAsync({ localData: questionData });
        this.startResultsPolling();
      }
    }
  }

  startResultsPolling() {
    window.setInterval(() => {
      this.loadQuestionResults();
    }, 5000);
  }

  async loadQuestionResults() {
    const { localData } = this.state;
    if (!localData) {
      this.getQuestionInfo();
      return;
    }

    try {
      const questionResultsResp = await ApiHelpers.read(
        `polling/${localData.seriesId}/${
          localData.lectureId
        }?application=${encodeURIComponent(
          localData.application
        )}&context=${encodeURIComponent(localData.context)}`
      );

      if (!questionResultsResp.good) {
        throw new Error('Error getting polling question');
      }

      const questionResults = JSON.parse(questionResultsResp.data).responseData;

      this.setPartial({ results: questionResults });
    } catch (error) {
      console.error(error);
    }
  }

  performRender() {
    const { results } = this.state;

    return (
      <div id="live-polling-view" className="live-polling-view text-center">
        {!results && (
          <div className="loading-spinner">
            <WaitSpinner message={'Getting results...'} />
          </div>
        )}
        {results && (
          <>
            <h1>{results.question}</h1>
            {has(results, 'visualizationType') && results.visualizationType && (
              <>
                {results.visualizationType === VISUALIZATION_TYPES.AVERAGE && (
                  <AverageValueResults results={results} />
                )}
                {results.visualizationType ===
                  VISUALIZATION_TYPES.PIE_CHART && (
                  <PieChartResults results={results} />
                )}
                {results.visualizationType ===
                  VISUALIZATION_TYPES.BAR_CHART && (
                  <BarChartResults results={results} />
                )}
                {results.visualizationType ===
                  VISUALIZATION_TYPES.WORD_CLOUD && (
                  <WordCloudResults results={results} />
                )}
                {results.visualizationType ===
                  VISUALIZATION_TYPES.TOP_ANSWERS && (
                  <TopAnswersResults results={results} />
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }
}
