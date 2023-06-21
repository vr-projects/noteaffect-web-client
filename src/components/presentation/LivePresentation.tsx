import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import {
  SrUiComponent,
  ApiHelpers,
  LoadStates,
  SrAppMessage,
} from 'react-strontium';
import DrawableContainer from '../containers/DrawableContainer';
import DrawableControlsContainer from '../containers/DrawableControlsContainer';
import PresentationRendererContainer from '../containers/PresentationRendererContainer';
import PresentationControlsContainer from '../containers/PresentationControlsContainer';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import AppMapper from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import SecurityShieldWall from '../security/SecurityShieldWall';
import ISecurityError from '../../models/ISecurityError';
import * as SecurityActions from '../../store/security/SecurityActions';
import * as PresentationActions from '../../store/presentation/PresentationActions';
import SpinnerMask from '../layout/SpinnerMask';

interface IConnectedLivePresentationProps extends DispatchProp<any> {
  isSecurityMode: boolean;
  isSecurityAppOn: boolean;
  isSecurityAppLoading: boolean;
  isSecurityCheckDone: boolean;
  securityErrors: ISecurityError[];
  userInformation?: IImmutableObject<IUserInformation>;
}

interface ILivePresentationProps {
  loading: LoadStates;
  isPresentationFullscreen: boolean;
  courseId: number;
  lectureId: number;
}

interface ILivePresentationState {
  loading: LoadStates;
  questionCount: number;
  containerRef: HTMLDivElement;
}

class LivePresentation extends SrUiComponent<
  IConnectedLivePresentationProps & ILivePresentationProps,
  ILivePresentationState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      questionCount: 0,
      containerRef: undefined,
    };
  }

  async onComponentMounted() {
    const { lectureId, dispatch } = this.props;
    await this.loadQuestionCountData(lectureId);
    await dispatch(PresentationActions.setIsOnLivePresentationView(true));
  }

  private securityAppCheckDone = false;
  async onNewProps(props) {
    const { courseId, lectureId, dispatch } = this.props;
    this.loadQuestionCountData(props.lectureId);

    // When security app ready, call action to SecApp /monitoring endpoint
    if (
      !this.securityAppCheckDone &&
      props.isSecurityMode &&
      props.isSecurityCheckDone
    ) {
      this.securityAppCheckDone = true;
      await dispatch(
        PresentationActions.updateUserSlide(courseId, lectureId, 1)
      );

      // await dispatch(
      //   SecurityActions.setSecurityAppMonitoring({
      //     isMonitoring: true,
      //     isLive: true,
      //   })
      // );
    }
  }

  async onComponentWillUnmount() {
    const { isSecurityMode, isSecurityCheckDone, dispatch } = this.props;
    dispatch(PresentationActions.setIsOnLivePresentationView(false));

    if (isSecurityMode && isSecurityCheckDone) {
      await dispatch(
        SecurityActions.setSecurityAppMonitoring({
          isMonitoring: false,
          isLive: false,
        })
      );
    }
  }

  getHandles() {
    return [AppBroadcastEvents.UserQuestionsUpdated];
  }

  onAppMessage(msg: SrAppMessage) {
    const { lectureId } = this.props;
    if (msg.action === AppBroadcastEvents.UserQuestionsUpdated) {
      this.loadQuestionCountData(lectureId);
    }
  }

  async loadQuestionCountData(lectureId: number) {
    const { courseId } = this.props;
    const { loading } = this.state;
    if (loading === LoadStates.Loading || !lectureId) {
      return;
    }

    try {
      this.setPartial({ loading: LoadStates.Loading });
      // TODO - this API response will change
      const resp = await ApiHelpers.read(
        `series/${courseId}/lectures/${lectureId}/questions/count`
      );

      if (!resp.good) {
        throw new Error('There was an error getting the questions');
      }

      const count = JSON.parse(resp.data).questions;
      this.setPartial({ loading: LoadStates.Succeeded, questionCount: count });
    } catch (error) {
      console.error(error);
      this.setPartial({
        loading: LoadStates.Failed,
        questionCount: 0,
      });
    }
  }

  updateRef(ref: HTMLDivElement) {
    const { dispatch } = this.props;
    const { containerRef } = this.state;
    if (!containerRef) {
      this.setPartial({ containerRef: ref });
      dispatch(PresentationActions.updateUiContainer(ref));
    }
  }

  performRender() {
    const {
      loading,
      courseId,
      userInformation,
      lectureId,
      isSecurityMode,
      isSecurityAppLoading,
      securityErrors,
    } = this.props;
    const { questionCount } = this.state;
    const currentUserId = userInformation.toJS().id;
    const showShieldWall = isSecurityAppLoading || !isEmpty(securityErrors);
    const showPresentation =
      !isSecurityMode ||
      (isSecurityMode && !isSecurityAppLoading && isEmpty(securityErrors));

    return (
      <div className="live-presentation" ref={(r) => this.updateRef(r)}>
        <SpinnerMask loading={loading} />
        {showShieldWall && (
          <SecurityShieldWall
            isSecurityAppLoading={isSecurityAppLoading}
            securityErrors={securityErrors}
          />
        )}
        {showPresentation && (
          <div className="live-presentation-wrapper">
            <div className="presentation-menu">
              <PresentationControlsContainer
                courseId={courseId}
                lectureId={lectureId}
              />
              <DrawableControlsContainer lectureQuestions={questionCount} />
            </div>
            <div className="presentation-content">
              <PresentationRendererContainer courseId={courseId} />
              <DrawableContainer
                courseId={courseId}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedLivePresentationProps,
  {},
  ILivePresentationProps
>(AppMapper.AppMapper)(LivePresentation);
