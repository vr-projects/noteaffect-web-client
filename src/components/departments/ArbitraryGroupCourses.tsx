import * as React from 'react';
import { connect } from 'react-redux';
import isNull from 'lodash/isNull';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, LoadStates, LoadIndicator } from 'react-strontium';
import IDepartment from '../../models/IDepartment';
import {
  GENERAL_COMPONENT,
  ARBITRARY_GROUP_COURSES_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import DepartmentCourse from './DepartmentCourse';
import AddCoursePopover from './AddCoursePopover';
import CorpAddMeetingModalButton from '../corp/CorpAddMeetingModalButton';
import EditParticipantsModal from '../shared/EditParticipantsModal';
import DepartmentEditDepartmentModal from './DepartmentEditDepartmentModal';
import IAdminTag from '../../models/IAdminTag';
import EditGroupsModal from './EditGroupsModal';
import IPeriod from '../../models/IPeriod';
import EditPeriodModal from './EditPeriodModal';
import AppMappers from '../../mappers/AppMappers';
import CorpEditMeetingModal from '../corp/CorpEditMeetingModal';
import CorpDeleteMeetingModal from '../corp/CorpDeleteMeetingModal';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';
import isEmpty from 'lodash/isEmpty';

interface IArbitraryCoursesProps {
  courses: ICourse[];
  periods: IPeriod[];
  departments: IDepartment[];
  departmentAdmin: boolean;
  groupId: number;
  groupType: string;
  groups: IAdminTag[];
  loading: LoadStates;
}

interface IConnectedArbitraryCoursesProps {
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
}

interface IArbitraryGroupCoursesState {
  departmentEdit: ICourse | null;
  groupEdit: ICourse | null;
  courseParticipantEdit: ICourse | null;
  periodEdit: ICourse | null;
  meetingEdit: ICourse | null;
  meetingDelete: ICourse | null;
  isEditMeetingModalOpen: boolean;
  isDeleteMeetingModalOpen: boolean;
  isEditParticipantsModalOpen: boolean;
}

class ArbitraryGroupCourses extends SrUiComponent<
  IArbitraryCoursesProps & IConnectedArbitraryCoursesProps,
  IArbitraryGroupCoursesState
> {
  initialState() {
    return {
      courses: [],
      courseParticipantEdit: null,
      departmentEdit: null,
      groupEdit: null,
      periodEdit: null,
      meetingEdit: null,
      meetingDelete: null,
      isEditMeetingModalOpen: false,
      isDeleteMeetingModalOpen: false,
      isEditParticipantsModalOpen: false,
    };
  }

  onNewProps(props: IArbitraryCoursesProps) {
    const { courses } = props;
    const { courseParticipantEdit } = this.state;

    if (!isNull(courseParticipantEdit)) {
      let updatedParticipantCourse;
      updatedParticipantCourse = courses.find(
        (c) => c.id === courseParticipantEdit.id
      );
      this.setPartial({
        courseParticipantEdit: updatedParticipantCourse,
        isEditParticipantsModalOpen: courseParticipantEdit !== null,
      });
    }
  }

  // TODO Need to refactor this out, ED version implement GenericModal over Popovers and Strontium modals
  editingAnything() {
    const {
      courseParticipantEdit,
      departmentEdit,
      groupEdit,
      periodEdit,
      meetingEdit,
    } = this.state;

    return (
      !isNull(courseParticipantEdit) ||
      !isNull(departmentEdit) ||
      !isNull(groupEdit) ||
      !isNull(meetingEdit) ||
      !isNull(periodEdit)
    );
  }

  editPeriods(course: ICourse) {
    if (this.editingAnything()) {
      return;
    }

    this.setPartial({ periodEdit: course });
  }

  editGroups(course: ICourse) {
    if (this.editingAnything()) {
      return;
    }

    this.setPartial({ groupEdit: course });
  }

  editParticipants(course: ICourse) {
    this.setPartial({
      courseParticipantEdit: course,
      isEditParticipantsModalOpen: !isNull(course),
    });
  }

  editDepartment(course: ICourse) {
    this.setPartial({ departmentEdit: course });
  }

  editMeeting(meeting: ICourse) {
    this.setPartial({
      meetingEdit: meeting,
      isEditMeetingModalOpen: !isNull(meeting),
    });
  }

  deleteMeeting(meeting: ICourse) {
    this.setPartial({
      meetingDelete: meeting,
      isDeleteMeetingModalOpen: !isNull(meeting),
    });
  }

  handleCreatedMeetingId(createdMeetingId) {
    // After creating a meeting, the InstructorCoursesComponent proceeds to display the add participants modal.  We are not currently doing that here.
  }

  performRender() {
    if (!this.props.groupId) {
      return null;
    }

    const {
      isEduVersion,
      isCorpVersion,
      courses,
      departmentAdmin,
      departments,
      groupId,
      groupType,
      groups,
      periods,
      loading,
    } = this.props;
    const {
      courseParticipantEdit,
      meetingEdit,
      meetingDelete,
      groupEdit,
      departmentEdit,
      periodEdit,
      isEditMeetingModalOpen,
      isDeleteMeetingModalOpen,
      isEditParticipantsModalOpen,
    } = this.state;
    const meetingDepartmentId = meetingEdit ? meetingEdit.departmentId : 1;

    return (
      <div>
        {groupType !== 'All' ? (
          <div className="row">
            <div className="col-sm-6">
              <h4>
                {`${Localizer.get(groupType)} ${Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSES_MEETINGS
                )}`}
              </h4>
            </div>
            {groupType === 'Department' ? (
              <div className="col-sm-6 margin margin-top-sm margin-bottom-sm text-right">
                {isEduVersion && (
                  <AddCoursePopover
                    isEduVersion={isEduVersion}
                    onDone={() =>
                      this.broadcast(AppBroadcastEvents.DepartmentCourseUpdated)
                    }
                    departmentId={groupId}
                    departments={departments}
                    periods={periods}
                  />
                )}
                {isCorpVersion &&
                  SystemRoleService.hasSomeRoles([
                    SystemRoles.PRESENTER,
                    SystemRoles.SALES_PRESENTER,
                    SystemRoles.DEPARTMENT_ADMIN,
                    SystemRoles.CLIENT_ADMIN,
                    SystemRoles.ADMIN,
                  ]) && (
                    <CorpAddMeetingModalButton
                      departmentId={groupId}
                      shouldBroadcastAdded={true}
                      onModalClose={(createdMeetingId) =>
                        this.handleCreatedMeetingId(createdMeetingId)
                      }
                    />
                  )}
              </div>
            ) : null}
          </div>
        ) : null}
        {loading === LoadStates.Loading && (
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.LOADING_COURSES_MEETINGS
            )}
            errorMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.ERROR_COURSES_MEETINGS
            )}
          />
        )}
        {isEmpty(courses) && loading === LoadStates.Succeeded && (
          <Alert bsStyle="info">
            {Localizer.getFormatted(ARBITRARY_GROUP_COURSES_COMPONENT.ERROR)}
          </Alert>
        )}
        {!isEmpty(courses) &&
          loading === LoadStates.Succeeded &&
          courses.map((c) => (
            <DepartmentCourse
              key={c.id}
              isEduVersion={isEduVersion}
              isCorpVersion={isCorpVersion}
              course={c}
              departmentAdmin={departmentAdmin}
              editPeriods={(c) => this.editPeriods(c)}
              editGroups={(c) => this.editGroups(c)}
              editParticipants={(c) => this.editParticipants(c)}
              editDepartment={(c) => this.editDepartment(c)}
              editMeeting={(c) => this.editMeeting(c)}
              deleteMeeting={(c) => this.deleteMeeting(c)}
              groups={groups}
              showPeriod
              periods={periods}
              showDepartment
              departments={departments}
            />
          ))}
        <EditParticipantsModal
          type={'edit'}
          show={isEditParticipantsModalOpen}
          course={courseParticipantEdit}
          onClose={() =>
            this.setPartial({
              courseParticipantEdit: null,
              isEditParticipantsModalOpen: false,
            })
          }
        />
        <DepartmentEditDepartmentModal
          departments={departments}
          course={departmentEdit}
          onClose={() => this.setPartial({ departmentEdit: null })}
        />
        <EditGroupsModal
          groups={groups}
          course={groupEdit}
          onClose={() => this.setPartial({ groupEdit: null })}
        />
        <EditPeriodModal
          periods={periods}
          course={periodEdit}
          onClose={() => this.setPartial({ periodEdit: null })}
        />
        {isCorpVersion && (
          <>
            <CorpEditMeetingModal
              departmentId={meetingDepartmentId}
              show={isEditMeetingModalOpen}
              meeting={meetingEdit}
              onClose={() => {
                this.setPartial({
                  meetingEdit: null,
                  isEditMeetingModalOpen: false,
                });
              }}
            />
            <CorpDeleteMeetingModal
              show={isDeleteMeetingModalOpen}
              meeting={meetingDelete}
              onClose={() => {
                this.setPartial({
                  meetingDelete: null,
                  isDeleteMeetingModalOpen: false,
                });
                this.broadcast(AppBroadcastEvents.MeetingDeleted);
              }}
            />
          </>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedArbitraryCoursesProps,
  {},
  IArbitraryCoursesProps
>(AppMappers.VersionMapper)(ArbitraryGroupCourses);
