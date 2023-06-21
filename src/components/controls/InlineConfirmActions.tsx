import React from 'react';
import { Button } from 'react-bootstrap';
import Localizer from '../../utilities/Localizer';

interface IInlineConfirmActionsProps {
  onActionConfirmed: () => void;
  initialText: string;
  hesitationText: string;
  confirmText: string;
  cancelText: string;
  disable?: boolean;
}

interface IInlineConfirmActionsState {
  confirmActionsOpen: boolean;
}

class InlineConfirmActions extends React.Component<
  IInlineConfirmActionsProps,
  IInlineConfirmActionsState
> {
  state = {
    confirmActionsOpen: false,
  };

  toggleConfirmRemove() {
    const { confirmActionsOpen } = this.state;

    this.setState({
      confirmActionsOpen: !confirmActionsOpen,
    });
  }

  render() {
    const { confirmActionsOpen } = this.state;
    const {
      disable = false,
      initialText,
      hesitationText,
      confirmText,
      cancelText,
      onActionConfirmed,
    } = this.props;

    return (
      <div className="inline-confirm-actions remove-controls">
        {!confirmActionsOpen ? (
          <Button
            bsStyle="link"
            className="na-btn-reset-width"
            disabled={disable}
            onClick={() => this.toggleConfirmRemove()}
          >
            {Localizer.get(initialText)}
          </Button>
        ) : (
          <span>
            <span>{Localizer.get(hesitationText)}</span>
            <Button
              bsStyle="link"
              className="na-btn-reset-width"
              disabled={disable}
              onClick={() => this.toggleConfirmRemove()}
            >
              {Localizer.get(cancelText)}
            </Button>
            <Button
              bsStyle="link"
              className="na-btn-reset-width"
              disabled={disable}
              onClick={() => onActionConfirmed()}
            >
              {Localizer.get(confirmText)}
            </Button>
          </span>
        )}
      </div>
    );
  }
}

export default InlineConfirmActions;
