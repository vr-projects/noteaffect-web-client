import * as React from 'react';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import isNull from 'lodash/isNull';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
  QueryUtility,
} from 'react-strontium';
import { COURSE_PARTICIPANTS_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import AppMappers from '../../../mappers/AppMappers';
import ICourse from '../../../models/ICourse';
import ILecture from '../../../models/ILecture';
import ISeriesAnalysis from '../../../interfaces/ISeriesAnalysis';
import ISeriesStudentsOverview from '../../../interfaces/ISeriesStudentsOverview';
import CourseAddParticipants from './CourseAddParticipants';
import Breadcrumb from '../../controls/Breadcrumb';
import BreadcrumbLink from '../../controls/BreadcrumbLink';
import ParticipantOverview from './ParticipantOverview';
import ParticipantsGrid from '../../shared/ParticipantsGrid';
import EditParticipantsModal from '../../shared/EditParticipantsModal';
import ParticipantsUtil from '../../../utilities/ParticipantsUtil';
import IUser from '../../../models/IUser';
import Filters from '../../../enums/Filters';

interface IConnectedCourseParticipantsProps {
  isEduVersion?: boolean;
  isCorpVersion?: boolean;
}

interface ICourseParticipantsProps {
  course: ICourse;
  participant: number;
  lectureId: number;
}
interface ICourseParticipantsState {
  lectures: ILecture[];
  analytics: ISeriesAnalysis;
  overviews: ISeriesStudentsOverview;
  loading: LoadStates;
  isEditParticipantsModalOpen: boolean;
  errorMessage: string | null;
  warningMessage: string | null;
}

class CourseParticipants extends SrUiComponent<
  IConnectedCourseParticipantsProps & ICourseParticipantsProps,
  ICourseParticipantsState
> {
  initialState() {
    return {
      lectures: [],
      analytics: null,
      overviews: null,
      loading: LoadStates.Unloaded,
      isEditParticipantsModalOpen: false,
      errorMessage: null,
      warningMessage: null,
    };
  }

  onComponentMounted() {
    this.loadData();
  }

  async loadData() {
    const { course } = this.props;
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    try {
      const lecturesResp = await ApiHelpers.read(
        `series/${course.id}/lectures`
      );

      const analyticsResp = await ApiHelpers.read(
        `series/${course.id}/data/analysis`,
        undefined,
        { contentType: undefined }
      );

      const filterQueryString = `?filter=${Filters.DefaultAnalyticsFilter}`;
      const overviewResp = await ApiHelpers.read(
        `series/${course.id}/data/seriesOverview${filterQueryString}`,
        undefined,
        { contentType: undefined }
      );

      const hasParticipants = course.participants.length > 0;

      // TODO NAC-143 check if normal to get no analytics, overview data
      // TODO Tech debt - refactor API calls to try catch blocks
      if ((!analyticsResp.good || !overviewResp.good) && hasParticipants) {
        this.setState({
          warningMessage: 'There is currently no participant data.',
        });
      }

      if (!lecturesResp.good && !analyticsResp.good && !overviewResp.good) {
        this.setPartial({
          loading: LoadStates.Failed,
          errorMessage: `There was an error getting your data`,
        });
        throw new Error('Error getting all data calls');
      }

      this.setPartial({
        lectures: lecturesResp.good ? JSON.parse(lecturesResp.data) : null,
        analytics: analyticsResp.good ? JSON.parse(analyticsResp.data) : null,
        overviews: overviewResp.good ? JSON.parse(overviewResp.data) : null,
        loading: LoadStates.Succeeded,
      });
    } catch (error) {
      this.setPartial({
        loading: LoadStates.Failed,
      });
    }
  }

  returnToList() {
    this.updateQuery(
      QueryUtility.buildQuery({ user: undefined, lecture: undefined })
    );
  }

  selectUser(user: IUser) {
    this.updateQuery(QueryUtility.buildQuery({ user: user.userId }));
  }

  selectedParticipantInfo() {
    const { participant, course } = this.props;
    if (!participant) {
      return null;
    }

    const user = ([...course.participants, ...course.observers] || []).find(
      (p) => p.userId === participant
    );

    if (!user) {
      return null;
    }

    if (!this.state.overviews) {
      return null;
    }

    const overview = (this.state.overviews.studentOverviews || []).find(
      (so) => so.userId === user.userId
    );

    const message = `There are currently no participation results available for ${ParticipantsUtil.displayName(
      user
    )}`;
    if (!overview) {
      return { user: null, overview: null, message };
    }

    return { user, overview };
  }

  performRender() {
    let participantData = this.selectedParticipantInfo();
    const hasParticipantMessage =
      !isNull(participantData) && !isNull(participantData.message);

    const { course, lectureId, isEduVersion, isCorpVersion } = this.props;
    const {
      analytics,
      overviews,
      isEditParticipantsModalOpen,
      loading,
      errorMessage,
      warningMessage,
    } = this.state;

    return (
      <div className="course-participants-page">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="">
            <h3>
              <Breadcrumb>
                <BreadcrumbLink
                  linkEnabled={!!participantData}
                  onClick={() => this.returnToList()}
                >
                  {Localizer.get('Participants')}
                </BreadcrumbLink>
                {participantData && participantData.user
                  ? ParticipantsUtil.displayName(participantData.user)
                  : null}
              </Breadcrumb>
            </h3>
          </div>
          <div className="ml-auto">
            {isEduVersion && (
              <CourseAddParticipants
                disabled={loading !== LoadStates.Succeeded}
                series={this.props.course}
              />
            )}
            {isCorpVersion && loading === LoadStates.Succeeded && (
              <Button
                bsStyle="default"
                disabled={loading !== LoadStates.Succeeded}
                onClick={() =>
                  this.setPartial({
                    isEditParticipantsModalOpen: true,
                  })
                }
              >
                <FaPen />
                <span className="ml-1">
                  {Localizer.get('Edit Participants')}
                </span>
              </Button>
            )}
          </div>
        </div>
        <LoadIndicator
          state={this.state.loading}
          loadingMessage={Localizer.getFormatted(
            COURSE_PARTICIPANTS_COMPONENT.LOADING
          )}
          errorMessage={errorMessage}
        />
        {loading === LoadStates.Succeeded &&
          !participantData &&
          !isNull(warningMessage) && (
            <Alert bsStyle="info">{warningMessage}</Alert>
          )}
        {loading === LoadStates.Succeeded && hasParticipantMessage && (
          <Alert bsStyle="info">{participantData.message}</Alert>
        )}
        {loading === LoadStates.Succeeded &&
        participantData &&
        participantData.user ? (
          <ParticipantOverview
            user={participantData.user}
            lectureId={lectureId}
            course={course}
            lectures={this.state.lectures}
            overview={participantData.overview}
          />
        ) : null}
        {loading === LoadStates.Succeeded && !participantData && (
          <ParticipantsGrid
            participants={course.participants}
            observers={course.observers}
            unregisteredParticipants={course.unregisteredParticipants}
            distributionInvitations={course.distributionInvitations}
            isCorpVersion={isCorpVersion}
            onParticipantSelected={(p) => {
              this.selectUser(p);
            }}
            disableDrilldown={isNull(analytics) && isNull(overviews)}
          />
        )}

        {!isNull(course) && (
          <EditParticipantsModal
            show={isEditParticipantsModalOpen}
            type={'edit'}
            course={course}
            courseId={course.id}
            onClose={() =>
              this.setPartial({
                isEditParticipantsModalOpen: false,
              })
            }
          />
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedCourseParticipantsProps,
  {},
  ICourseParticipantsProps
>(AppMappers.VersionMapper)(CourseParticipants);
