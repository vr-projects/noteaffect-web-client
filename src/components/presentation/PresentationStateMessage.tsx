import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import PresentationState from '../../PresentationState';
import Localizer from '../../utilities/Localizer';

interface IPresentationStateMessageProps {
  presentationState: PresentationState;
  observerOnly: boolean;
  unansweredPoll?: boolean;
}

interface IPresentationStateMessageState {}

export default class PresentationStateMessage extends SrUiComponent<
  IPresentationStateMessageProps,
  IPresentationStateMessageState
> {
  private getMessage(): string {
    const { presentationState, unansweredPoll, observerOnly } = this.props;

    if (presentationState === PresentationState.Unstarted) {
      return Localizer.get('Please wait for the presentation to start.');
    }

    if (unansweredPoll && !observerOnly) {
      return Localizer.get(
        'This segment will be displayed after you have answered the polling question.'
      );
    }
    // TODO tech debt explore if needed
    // if (unansweredPoll && observerOnly) {
    //   return Localizer.get('DISPLAY SLIDE');
    // }

    return null;
  }

  performRender() {
    const message = this.getMessage();

    return message ? (
      <p className="presentation-state-message state-message">{message}</p>
    ) : null;
  }
}
