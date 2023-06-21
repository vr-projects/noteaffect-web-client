import React from 'react';
import Localizer from '../../utilities/Localizer';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import { Image as ImageComponent } from 'react-bootstrap';
import CorpAddMeetingModalButton from './CorpAddMeetingModalButton';
import CalendarSVG from '../../svgs/calendar-bro.svg';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface ICorpMeetingsZeroProps {
  isPresenter?: boolean;
  className?: string;
  handleCreatedMeetingId?: (meetingId) => void;
  shouldBroadcastAdded: boolean;
}

const CorpMeetingsZero = ({
  isPresenter = SystemRoleService.hasSomeRoles([
    SystemRoles.PRESENTER,
    SystemRoles.SALES_PRESENTER,
    SystemRoles.DEPARTMENT_ADMIN,
    SystemRoles.CLIENT_ADMIN,
    SystemRoles.ADMIN,
  ]),
  className = '',
  handleCreatedMeetingId,
  shouldBroadcastAdded,
}: ICorpMeetingsZeroProps) => {
  const isDashboardView = window.location.toString().includes('dashboard');
  return (
    <div className={`corp-meetings-zero ${className}`}>
      <div className="zero-grid">
        <div className="message-btn-container">
          <h1 className="message">
            {Localizer.getFormatted(GENERAL_COMPONENT.NO_COURSES_MEETINGS)}
          </h1>
          {isPresenter && !isDashboardView && (
            <CorpAddMeetingModalButton
              className="add-btn"
              onModalClose={(createdMeetingId) =>
                handleCreatedMeetingId(createdMeetingId)
              }
              shouldBroadcastAdded={shouldBroadcastAdded}
            />
          )}
          {!isPresenter ||
            (isDashboardView && (
              <p className="participant-message">
                {Localizer.get(
                  "Meetings you've been invited to or RSVP'd to will show up here in a list."
                )}
              </p>
            ))}
        </div>
        <div className="svg-image-container">
          <ImageComponent
            alt="Woman flipping empty calendar"
            className="svg-image"
            src={CalendarSVG.toString()}
          />
        </div>
      </div>
    </div>
  );
};

export default CorpMeetingsZero;
