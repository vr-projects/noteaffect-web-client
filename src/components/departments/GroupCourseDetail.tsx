import * as React from 'react';
import {
  SrUiComponent,
  TabbedViewer,
  Animated,
  QueryUtility,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import CourseEngagement from '../shared/CourseEngagement';
import Numbers from '../../utilities/Numbers';
import CourseAnalytics from '../shared/CourseAnalytics';
import ParticipantsGrid from '../shared/ParticipantsGrid';

interface IGroupCourseDetailProps {
  course: ICourse;
  options: any; // TODO tech debt make interface or type, is from query, renamed to menu
  isCorpVersion: boolean;
}

interface IGroupCourseDetailState {}

export default class GroupCourseDetail extends SrUiComponent<
  IGroupCourseDetailProps,
  IGroupCourseDetailState
> {
  initialState(): IGroupCourseDetailState {
    return {};
  }

  tabs() {
    const { course, isCorpVersion, options } = this.props;
    const lectureId = Numbers.parse(options.lecture);
    const documentId = Numbers.parse(options.documentId);

    const tabs = [
      {
        title: Localizer.get('Engagement'),
        id: 'engagement',
        content: (
          <CourseEngagement
            course={course}
            lectureId={lectureId}
            isDepartment={true}
          />
        ),
      },
      {
        title: Localizer.get('Analytics'),
        id: 'analytics',
        content: (
          <Animated in key="engagement-tab">
            <CourseAnalytics
              isDepartment={true}
              course={course}
              lectureId={lectureId}
              documentId={documentId}
            />
          </Animated>
        ),
      },
      {
        title: Localizer.get('Participants'),
        id: 'participants',
        content: (
          <Animated in key="lectures-tab">
            <ParticipantsGrid
              participants={course.participants}
              unregisteredParticipants={course.unregisteredParticipants}
              distributionInvitations={course.distributionInvitations}
              isCorpVersion={isCorpVersion}
              disableDrilldown={true}
            />
          </Animated>
        ),
      },
    ];
    return tabs;
  }

  allowedMenu() {
    const { options } = this.props;
    if (
      !options.courseMenu ||
      ['participants', 'engagement', 'analytics'].indexOf(
        options.courseMenu
      ) === -1
    ) {
      return 'engagement';
    }

    return options.courseMenu;
  }

  performRender() {
    return (
      <div>
        <TabbedViewer
          tabSelected={(id) =>
            this.updateQuery(QueryUtility.buildQuery({ courseMenu: id }))
          }
          tabs={this.tabs()}
          currentSelection={this.allowedMenu()}
        ></TabbedViewer>
      </div>
    );
  }
}
