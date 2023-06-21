import * as React from 'react';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  SrAppMessage,
} from 'react-strontium';
import ILecture from '../../models/ILecture';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface ILectureReviewerProps {
  lecture: ILecture;
}

interface ILectureReviewerState {
  loading: LoadStates;
  count: number;
}

export default class LectureQuestionsCountBadge extends SrUiComponent<
  ILectureReviewerProps,
  ILectureReviewerState
> {
  initialState(): ILectureReviewerState {
    return { loading: LoadStates.Unloaded, count: 0 };
  }

  onComponentMounted() {
    this.getQuestionCount();
  }

  getHandles() {
    return [AppBroadcastEvents.UserQuestionsUpdated];
  }

  onAppMessage(msg: SrAppMessage) {
    if (msg.action === AppBroadcastEvents.UserQuestionsUpdated) {
      this.getQuestionCount();
    }
  }

  async getQuestionCount() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    const resp = await ApiHelpers.read(
      `series/${this.props.lecture.seriesId}/lectures/${this.props.lecture.id}/questions/count`
    );

    let count = 0;
    if (resp.good) {
      count = JSON.parse(resp.data).questions;
    }

    this.set({ loading: LoadStates.Succeeded, count });
  }

  performRender() {
    if (this.state.count !== 0) {
      return <span className="label label-primary">{this.state.count}</span>;
    }

    return null;
  }
}
