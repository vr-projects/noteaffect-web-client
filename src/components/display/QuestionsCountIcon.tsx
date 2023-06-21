import * as React from 'react';
import { connect } from 'react-redux';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  SrAppMessage,
} from 'react-strontium';
import { ImSpinner2 } from 'react-icons/im';
import { FaCommentAlt } from 'react-icons/fa';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import Localizer from '../../utilities/Localizer';
import AppMappers from '../../mappers/AppMappers';

interface IConnectedQuestionsCountIconProps {
  isSecurityMode: boolean;
  isSecurityAppLoading: boolean;
  isSecurityCheckDone: boolean;
}

interface IQuestionsCountIconProps {
  isInstructor?: boolean;
  courseId: number;
}

interface IQuestionsCountIconState {
  loading: LoadStates;
  count: number;
  colorizeIcon: boolean;
}

class QuestionsCountIcon extends SrUiComponent<
  IConnectedQuestionsCountIconProps & IQuestionsCountIconProps,
  IQuestionsCountIconState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      count: 0,
      colorizeIcon: false,
    };
  }

  onComponentMounted() {
    const { isSecurityMode } = this.props;
    if (!isSecurityMode) {
      this.getQuestionCount();
    }
  }
  // Secured Series for Safari and Firefox require user to click alert popup
  // This allows Redux store to pass through changed flags, allow API call after check done
  private securityAppCheckDone = false;
  onNewProps(props) {
    const { isSecurityMode, isSecurityCheckDone } = props;
    if (!this.securityAppCheckDone && isSecurityCheckDone && isSecurityMode) {
      this.securityAppCheckDone = true;
      this.getQuestionCount();
    }
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
    const { isInstructor = false, courseId } = this.props;
    const { loading } = this.state;
    if (loading === LoadStates.Loading) {
      return;
    }

    try {
      this.setPartial({ loading: LoadStates.Loading });
      const resp = await ApiHelpers.read(`series/${courseId}/questions/count`);

      if (!resp.good) {
        throw new Error(Localizer.get('There was an error getting questions'));
      }
      const { questions, answered } = JSON.parse(resp.data);
      const count = questions - answered;
      const colorizeIcon = isInstructor ? count > 0 : answered > 0;

      this.setPartial({
        loading: LoadStates.Succeeded,
        count,
        colorizeIcon,
      });
    } catch (error) {
      this.setPartial({
        loading: LoadStates.Failed,
        count: null,
        colorizeIcon: null,
      });
    }
  }

  performRender() {
    const { loading, colorizeIcon } = this.state;

    if (loading === LoadStates.Loading) {
      return <ImSpinner2 className="spinner-spin" />;
    }

    return (
      <span className="questions-count-icon">
        <FaCommentAlt
          className={`${colorizeIcon ? 'text-success-light' : ''}`}
        />
      </span>
    );
  }
}

export default connect<
  IConnectedQuestionsCountIconProps,
  {},
  IQuestionsCountIconProps
>(AppMappers.AppMapper)(QuestionsCountIcon);
