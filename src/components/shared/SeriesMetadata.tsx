import React from 'react';
import { connect } from 'react-redux';
import isNull from 'lodash/isNull';
import { Well } from 'react-bootstrap';
import isUndefined from 'lodash/isUndefined';
import AppMappers from '../../mappers/AppMappers';
import ISeries from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import Localizer from '../../utilities/Localizer';
import { getIsObserverOnly } from '../../services/ParticipantPermissionService';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import SharePermissionPanel from '../corp/SharePermissionPanel';

import DateFormatUtil, {
  longDateTimeFormat,
} from '../../utilities/DateFormatUtil';

interface IConnectedSeriesMetadataProps {
  userInformation?: IImmutableObject<IUserInformation>;
}

interface ISeriesMetadataProps {
  series: ISeries;
  presentation?: ILecture | null;
  hasPresentations?: boolean;
  hasDocuments?: boolean;
  className?: string;
}

const SeriesMetadata = ({
  userInformation,
  series,
  presentation,
  hasPresentations = false,
  hasDocuments = false,
  className = '',
}: ISeriesMetadataProps & IConnectedSeriesMetadataProps) => {
  const { firstName, lastName, id: currentUserId } = userInformation.toJS();
  const viewerName = `${firstName} ${lastName}`;

  const isPresenter = series.participants.some(
    (participant) =>
      participant.lecturer && participant.userId === currentUserId
  );

  const isObserverOnly = getIsObserverOnly(series, currentUserId);

  return (
    <div className={`series-metadata ${className}`}>
      <div className="series-info">
        <Well className="p-1 m-0">
          <p className="series-item">
            <span className="series-label">
              {`${Localizer.getFormatted(
                GENERAL_COMPONENT.COURSE_MEETING_NAME
              )}:`.toLocaleUpperCase()}
            </span>
            <span className="series-data">{series.name}</span>
          </p>
          <p className="series-item">
            <span className="series-label">
              {`${Localizer.getFormatted(
                GENERAL_COMPONENT.INSTRUCTOR_PRESENTER
              )}:`.toLocaleUpperCase()}
            </span>
            <span className="series-data">{series.instructors.join(', ')}</span>
          </p>
          <p className="series-item">
            <span className="series-label">
              {`${
                isObserverOnly
                  ? Localizer.getFormatted(GENERAL_COMPONENT.VIEWER)
                  : Localizer.getFormatted(
                      GENERAL_COMPONENT.STUDENT_PARTICIPANT
                    )
              }:`.toLocaleUpperCase()}
            </span>
            <span className="series-data">{viewerName}</span>
          </p>
          <p className="series-item">
            <span className="series-label">
              {`${Localizer.getFormatted(
                GENERAL_COMPONENT.START
              )}:`.toLocaleUpperCase()}
            </span>
            <span className="series-data">
              {DateFormatUtil.getUnixToUserTimezone(
                series.courseStart,
                longDateTimeFormat
              )}{' '}
              {`(${DateFormatUtil.getUnixToUserTimezoneAbbr(
                series.courseStart
              )})`}
            </span>
          </p>
          <p className="series-item">
            <span className="series-label">
              {`${Localizer.getFormatted(
                GENERAL_COMPONENT.END
              )}:`.toLocaleUpperCase()}{' '}
            </span>
            <span className="series-data">
              {DateFormatUtil.getUnixToUserTimezone(
                series.courseEnd,
                longDateTimeFormat
              )}{' '}
              {`(${DateFormatUtil.getUnixToUserTimezoneAbbr(
                series.courseEnd
              )})`}
            </span>
          </p>
          {!isUndefined(presentation) && !isNull(presentation) && (
            <>
              <p className="series-item">
                <span className="series-label">{`${Localizer.get(
                  'PRESENTATION'
                )}:`}</span>
                <span className="series-data">{presentation.name}</span>
              </p>
              <p className="series-item">
                <span className="series-label">{`${Localizer.get(
                  'PRESENTED'
                )}:`}</span>
                <span className="series-data">
                  {DateFormatUtil.getUnixToUserTimezone(
                    presentation.started,
                    longDateTimeFormat
                  )}{' '}
                  {`(${DateFormatUtil.getUnixToUserTimezoneAbbr(
                    presentation.started
                  )})`}
                </span>
              </p>
            </>
          )}
        </Well>
      </div>
      <div className="sharing-info">
        <SharePermissionPanel
          permissionCode={series.sharePermission}
          isPresenter={isPresenter}
          isObserverOnly={isObserverOnly}
          series={series}
          hasPresentations={hasPresentations}
          hasDocuments={hasDocuments}
        />
      </div>
    </div>
  );
};

export default connect<IConnectedSeriesMetadataProps, {}, ISeriesMetadataProps>(
  AppMappers.AppMapper
)(SeriesMetadata);
