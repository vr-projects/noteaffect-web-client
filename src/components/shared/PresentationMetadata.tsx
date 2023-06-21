import * as React from 'react';
import { connect } from 'react-redux';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import DateFormatUtil, {
  longDateTimeFormat,
} from '../../utilities/DateFormatUtil';
import { getSharePermissionDescription } from '../../services/SharePermissionService';
import SharePermissionBadge from '../corp/SharePermissionBadge';
import HelpIconTooltip from '../controls/HelpIconTooltip';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';

interface IConnectedPresentationMetadataProps {
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}
interface IPresentationMetadataProps {
  isCorpVersion?: boolean;
  printVersion?: boolean;
  course: ICourse;
  lecture?: ILecture;
  className?: string;
}

const PresentationMetadata = ({
  isCorpVersion,
  printVersion,
  course,
  lecture,
  className = '',
}: IConnectedPresentationMetadataProps & IPresentationMetadataProps) => {
  return (
    <div className={`presentation-metadata ${className}`}>
      <p className="helper-message">
        <span className="mr-1">
          {!printVersion &&
            Localizer.getFormatted(
              GENERAL_COMPONENT.COURSE_MEETING
            ).toUpperCase()}
          {printVersion && isCorpVersion && Localizer.get('MEETING')}
          {printVersion && !isCorpVersion && Localizer.get('COURSE')}
        </span>
        <span>{course.name}</span>
      </p>
      <p className="helper-message">
        <span className="mr-1">{Localizer.get('PRESENTERS')}</span>
        <span>{course.instructors.join(', ')}</span>
      </p>
      <p className="helper-message">
        <span className="mr-1">{Localizer.get('SHARING')}</span>
        <SharePermissionBadge
          permissionCode={course.sharePermission}
          className="mr-1"
        />
        <HelpIconTooltip
          className="p-0"
          tooltipText={getSharePermissionDescription(course.sharePermission)}
        />
      </p>
      <p className="helper-message">
        <span className="mr-1">{Localizer.get('PRESENTATION')}</span>
        <span>{lecture.name}</span>
      </p>
      <p className="helper-message">
        <span className="mr-1">{Localizer.get('PRESENTED')}</span>
        <span>
          {DateFormatUtil.getUnixToUserTimezone(
            lecture.started,
            longDateTimeFormat
          )}{' '}
          {`(${DateFormatUtil.getUnixToUserTimezoneAbbr(lecture.started)})`}
        </span>
      </p>
    </div>
  );
};

export default connect<
  IConnectedPresentationMetadataProps,
  {},
  IPresentationMetadataProps
>(AppMappers.AppMapper)(PresentationMetadata);
