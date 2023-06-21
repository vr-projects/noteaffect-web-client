import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  ApiHelpers,
  QueryUtility,
} from 'react-strontium';
import Filters from '../../enums/Filters';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';
import ISeriesStudentsOverview from '../../interfaces/ISeriesStudentsOverview';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import LecturesUtil from '../../utilities/LecturesUtil';
import Localizer from '../../utilities/Localizer';
import { COURSE_ENGAGEMENT_COMPONENT } from '../../version/versionConstants';
import CourseEngagementTrends from '../shared/CourseEngagementTrends';
import LectureEngagementList from '../shared/LectureEngagementList';
import LectureEngagement from '../shared/LectureEngagement';
import Breadcrumb from '../controls/Breadcrumb';
import BreadcrumbLink from '../controls/BreadcrumbLink';
import ParticipantsUtil from '../../utilities/ParticipantsUtil';
import AnalyticsFilterMultiRadioToggler from '../controls/AnalyticsFilterMultiRadioToggler';

interface ICourseEngagementProps {
  course: ICourse;
  lectureId: number;
  userId?: number;
  isDepartment: boolean;
}

interface ICourseEngagementState {
  lectures: ILecture[];
  analytics: ISeriesAnalysis;
  overviews: ISeriesStudentsOverview;
  loading: LoadStates;
}

export default class CourseEngagement extends SrUiComponent<
  ICourseEngagementProps,
  ICourseEngagementState
> {
  initialState() {
    return {
      lectures: [],
      analytics: null,
      overviews: null,
      loading: LoadStates.Unloaded,
    };
  }

  onComponentMounted() {
    this.loadData(Filters.DefaultAnalyticsFilter);
  }

  async loadData(analyticsFilter) {
    const { course, isDepartment } = this.props;
    const { loading } = this.state;
    if (loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const filterQueryString = !isEmpty(analyticsFilter)
      ? `?filter=${analyticsFilter}`
      : '';

    const lecturesResp = await ApiHelpers.read(`series/${course.id}/lectures`);
    const analyticsApiUrl = isDepartment
      ? `analytics/series/${course.id}${filterQueryString}`
      : `series/${course.id}/data/analysis${filterQueryString}`;
    const analyticsResp = await ApiHelpers.read(analyticsApiUrl, undefined, {
      contentType: undefined,
    });
    const overviewApiUrl = isDepartment
      ? `analytics/series/${course.id}/overviews${filterQueryString}`
      : `series/${course.id}/data/seriesOverview${filterQueryString}`;
    const overviewResp = await ApiHelpers.read(overviewApiUrl, undefined, {
      contentType: undefined,
    });

    if (!(lecturesResp.good && analyticsResp.good && overviewResp.good)) {
      this.setPartial({ loading: LoadStates.Failed });
      return;
    }

    this.setPartial({
      lectures: JSON.parse(lecturesResp.data),
      analytics: JSON.parse(analyticsResp.data),
      overviews: JSON.parse(overviewResp.data),
      loading: LoadStates.Succeeded,
    });
  }

  selectedLecture() {
    const { lectureId } = this.props;
    if (!lectureId) return null;
    return this.lecturesForAnalysis().filter((l) => l.id === lectureId)[0];
  }

  // !isDepartment presenter use, not for departments
  selectedUser() {
    const { userId, course } = this.props;
    const lecture = this.selectedLecture();
    if (!userId || !lecture) {
      return null;
    }

    return course.participants.filter((p) => p.userId === userId)[0];
  }

  returnToOverview() {
    this.updateQuery(
      QueryUtility.buildQuery({ lecture: undefined, user: undefined })
    );
  }

  returnToLecture() {
    this.updateQuery(QueryUtility.buildQuery({ user: undefined }));
  }

  lecturesForAnalysis() {
    const { lectures = [], analytics } = this.state;
    const completed = lectures.filter(
      (l) => l.started != null && l.ended != null
    );
    if (!analytics) {
      return [];
    }
    return completed
      .filter(
        (f) =>
          analytics.lectureAnalyses.filter((la) => la.lectureId === f.id)[0]
      )
      .sort((a, b) => a.ended - b.ended);
  }

  performRender() {
    const { userId, isDepartment } = this.props;
    const { loading, analytics, overviews } = this.state;
    const lecture = this.selectedLecture();
    const user = !isDepartment ? this.selectedUser() : null;
    const showLectures = !isDepartment
      ? !(!lecture || userId || !analytics || !overviews)
      : !(!lecture || !analytics || !overviews);
    return (
      <div className="course-engagement">
        <AnalyticsFilterMultiRadioToggler
          onFilterToggled={(value) => this.loadData(value)}
          isVisible={true}
          titleNode={
            <h3>
              <Breadcrumb>
                <BreadcrumbLink
                  linkEnabled={!!lecture}
                  onClick={() => this.returnToOverview()}
                >
                  {Localizer.getFormatted(COURSE_ENGAGEMENT_COMPONENT.TITLE)}
                </BreadcrumbLink>
                {lecture ? (
                  <BreadcrumbLink
                    linkEnabled={!isDepartment ? !!user : true}
                    onClick={() => this.returnToLecture()}
                  >
                    {LecturesUtil.fallbackName(lecture)}
                  </BreadcrumbLink>
                ) : null}
                {user ? ParticipantsUtil.displayName(user) : null}
              </Breadcrumb>
            </h3>
          }
        />
        <LoadIndicator
          state={loading}
          loadingMessage={Localizer.get('Getting engagement information...')}
          errorMessage={Localizer.getFormatted(
            COURSE_ENGAGEMENT_COMPONENT.ERROR
          )}
          alertClassName="alert-info"
        />
        <CourseEngagementTrends
          {...this.props}
          lectures={this.lecturesForAnalysis()}
          analytics={analytics}
          overviews={overviews}
          loading={loading}
        />
        <LectureEngagementList
          {...this.props}
          lectures={this.lecturesForAnalysis()}
          loading={loading}
        />
        {showLectures ? (
          <LectureEngagement
            {...this.props}
            lectures={this.lecturesForAnalysis()}
            analytics={analytics}
            overviews={overviews}
            loading={loading}
            isDepartment={false}
          />
        ) : null}
      </div>
    );
  }
}
