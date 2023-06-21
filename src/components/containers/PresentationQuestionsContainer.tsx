import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import * as Immutable from 'immutable';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  SrAppMessage,
} from 'react-strontium';
import PresentationData from '../../utilities/PresentationData';
import PresentationMappers from '../../mappers/PresentationMappers';
import { IImmutablePresentedDataMap } from '../../interfaces/IPresentedData';
import { IImmutableCourseNotesMap } from '../../interfaces/IPresentationDataProps';
import IUserQuestion from '../../models/IUserQuestion';
import LivePresentationQuestionsComponent from '../presentation/LivePresentationQuestionsComponent';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IPresentationQuestionsContainerProps extends DispatchProp<any> {
  presentedData?: Immutable.Map<string, IImmutablePresentedDataMap>;
  notesData?: IImmutableCourseNotesMap;
  courseId: number;
  collapsed: boolean;
  container?: HTMLDivElement;
}

interface IPresentationQuestionsContainerState {
  loading: LoadStates;
  lectureId: number;
  questions: IUserQuestion[];
}

class PresentationQuestionsContainer extends SrUiComponent<
  IPresentationQuestionsContainerProps,
  IPresentationQuestionsContainerState
> {
  private _handle: number = null;

  initialState() {
    return {
      lectureId: undefined,
      questions: [],
      loading: LoadStates.Unloaded,
    };
  }

  onComponentMounted() {
    this._handle = window.setInterval(() => {
      this.updateQuestions(this.props);
    }, 60000);
  }

  getHandles() {
    return [
      AppBroadcastEvents.UserQuestionsUpdated,
      AppBroadcastEvents.PresentationStarting,
    ];
  }

  onAppMessage(msg: SrAppMessage) {
    if (msg.action === AppBroadcastEvents.UserQuestionsUpdated) {
      this.updateQuestions(this.props);
    } else if (
      msg.action === AppBroadcastEvents.PresentationStarting &&
      msg.data.seriesId === this.props.courseId &&
      msg.data.lectureId !== this.state.lectureId
    ) {
      this.setPartial({ lectureId: msg.data.lectureId });
    }
  }

  onComponentWillUnmount() {
    window.clearInterval(this._handle);
  }

  onNewProps(props: IPresentationQuestionsContainerProps) {
    this.updateQuestions(props);
  }

  async updateQuestions(props: IPresentationQuestionsContainerProps) {
    let lectureId = this.state.lectureId;
    if (!lectureId) {
      lectureId = PresentationData.currentLectureId(
        props.courseId,
        props.presentedData
      );
      if (!lectureId) {
        return;
      }

      this.setPartial({ lectureId: lectureId });
    }

    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    const questionsResp = await ApiHelpers.read(
      `series/${this.props.courseId}/lectures/${lectureId}/questions`
    );

    if (!this.mounted()) {
      return;
    }

    if (questionsResp.good) {
      const questions = this.sortedQuestions(JSON.parse(questionsResp.data));
      this.setPartial({ questions: questions, loading: LoadStates.Succeeded });
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  sortedQuestions(questions: IUserQuestion[]): IUserQuestion[] {
    questions = questions || [];
    return questions
      .filter((q) => q.lectureId === this.state.lectureId)
      .sort((a, b) => {
        const rankOrder = (b.votes || 0) - (a.votes || 0);
        if (rankOrder !== 0) {
          return rankOrder;
        }

        const dateOrder = (b.created || 3000000000) - (a.created || 3000000000);
        if (dateOrder !== 0) {
          return dateOrder;
        }

        return (b.question || '').localeCompare(a.question || '');
      });
  }

  performRender() {
    let data = PresentationData.currentData(
      this.props.courseId,
      this.props.presentedData
    );
    let slideNumber = data
      ? data.get('userSlide') || data.get('currentSlide') || 0
      : 0;
    let enabled = slideNumber !== 0;

    return (
      <LivePresentationQuestionsComponent
        collapsed={this.props.collapsed}
        loading={this.state.loading}
        lectureId={this.state.lectureId}
        courseId={this.props.courseId}
        enabled={enabled}
        currentSlide={PresentationData.currentUserSlide(
          this.props.courseId,
          this.props.presentedData
        )}
        questions={this.sortedQuestions(this.state.questions)}
      />
    );
  }
}

export default connect<any, void, IPresentationQuestionsContainerProps>(
  PresentationMappers.PresentationNotesMapper
)(PresentationQuestionsContainer);
