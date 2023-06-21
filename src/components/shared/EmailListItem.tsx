/**
 * Shared component for both unregistered participants and distribution lists
 */
import React from 'react';
import IUnregisteredParticipant from '../../models/IUnregisteredParticipant';
import IDistributionInvitation from '../../models/IDistributionInvitation';
import InlineConfirmActions from '../controls/InlineConfirmActions';

interface IEmailListItemProps {
  emailListItem: IUnregisteredParticipant | IDistributionInvitation;
  removeEmailListItem?: (id) => void;
  className?: string;
  isLoading?: boolean;
}

interface IEmailListItemState {}

class EmailListItem extends React.Component<
  IEmailListItemProps,
  IEmailListItemState
> {
  render() {
    const {
      emailListItem,
      removeEmailListItem,
      className = '',
      isLoading,
    } = this.props;

    return (
      <li
        className={`email-list-item list-item-unstyled ${className}`}
        key={emailListItem.id}
      >
        <span className="email">{emailListItem.email}</span>

        {!!removeEmailListItem && (
          <>
            <InlineConfirmActions
              onActionConfirmed={() => removeEmailListItem(emailListItem.id)}
              initialText="Remove"
              hesitationText="Are you sure?"
              confirmText="Yes"
              cancelText="No"
              disable={isLoading}
            />
          </>
        )}
      </li>
    );
  }
}

export default EmailListItem;
