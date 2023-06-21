import * as React from 'react';
import { connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  QueryUtility,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import IDocument from '../../models/IDocument';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import Filters from '../../enums/Filters';
import {
  COURSE_ANALYTICS_COMPONENT,
  GENERAL_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import LecturesUtil from '../../utilities/LecturesUtil';
import ErrorUtil from '../../utilities/ErrorUtil';
import DateFormatUtil, {
  verboseDateTimeFormat,
} from '../../utilities/DateFormatUtil';
import AppMappers from '../../mappers/AppMappers';
import Breadcrumb from '../controls/Breadcrumb';
import BreadcrumbLink from '../controls/BreadcrumbLink';
import DrilldownMenuItem from '../controls/DrilldownMenuItem';
import CourseAnalyticsTrends from '../charts/CourseAnalyticsTrends';
import AnalyticsFilterMultiRadioToggler from '../controls/AnalyticsFilterMultiRadioToggler';
import LectureAnalytics from './LectureAnalytics';
import CourseAnalyticsDocumentTable from './CourseAnalyticsDocumentTable';

interface IConnectedCourseAnalyticsProps {
  userInformation?: IImmutableObject<IUserInformation>;
}

interface ICourseAnalyticsProps {
  isDepartment: boolean;
  course: ICourse;
  lectureId: number;
  documentId: number;
}

interface ICourseAnalyticsState {
  lectures: ILecture[];
  lecturesLoadState: LoadStates;
  documents: IDocument[];
  documentsLoadState: LoadStates;
  analytics: ISeriesAnalysis;
  analyticsLoadState: LoadStates;
  selectedLecture: ILecture;
  selectedDocument: IDocument;
}

class CourseAnalytics extends SrUiComponent<
  IConnectedCourseAnalyticsProps & ICourseAnalyticsProps,
  ICourseAnalyticsState
> {
  initialState() {
    return {
      lectures: [],
      lecturesLoadState: LoadStates.Unloaded,
      documents: [],
      documentsLoadState: LoadStates.Unloaded,
      analytics: null,
      analyticsLoadState: LoadStates.Unloaded,
      selectedLecture: null,
      selectedDocument: null,
    };
  }

  async onComponentMounted() {
    // ** Logic to set lectureId, documentId to selectedLecture, selectedDocument
    await this.loadData(Filters.DefaultAnalyticsFilter);
    this.handleLoadDrilldown();
  }

  handleLoadDrilldown() {
    const { lectureId, documentId } = this.props;

    if (!isUndefined(lectureId) && isNumber(lectureId)) {
      const selectedLecture = this.getSelectedLecture();
      this.selectLecture(selectedLecture);
      return;
    }
    if (!isUndefined(documentId) && isNumber(documentId)) {
      const selectedDocument = this.getSelectedDocument();

      if (isNull(selectedDocument)) {
        return this.returnToMeetingAnalytics();
      }

      this.selectDocument(selectedDocument);
      return;
    }

    return this.returnToMeetingAnalytics();
  }

  async loadData(analyticsFilter: Filters) {
    await this.loadLectures();
    await this.loadDocuments();
    await this.loadAnalytics(analyticsFilter);
  }

  async loadLectures() {
    const { course } = this.props;

    try {
      this.setPartial({ lecturesLoadState: LoadStates.Loading });
      const lecturesResp = await ApiHelpers.read(
        `series/${course.id}/lectures`
      );

      if (!lecturesResp.good) {
        throw new Error(
          Localizer.get('There was an error getting the presentation data')
        );
      }
      if (!isEmpty(lecturesResp.errors)) {
        ErrorUtil.throwErrorMessage(lecturesResp.errors);
      }

      this.setPartial({
        lectures: JSON.parse(lecturesResp.data),
        lecturesLoadState: LoadStates.Succeeded,
      });
    } catch (error) {
      console.error(error);
      this.setPartial({
        lecturesLoadState: LoadStates.Failed,
      });
    }
  }

  async loadDocuments() {
    const { course } = this.props;

    try {
      this.setPartial({ documentsLoadState: LoadStates.Loading });
      const documentsResp = await ApiHelpers.read(
        `series/${course.id}/documents`
      );

      if (!documentsResp.good) {
        throw new Error(
          Localizer.get('There was an error getting the documents data')
        );
      }
      if (!isEmpty(documentsResp.errors)) {
        ErrorUtil.throwErrorMessage(documentsResp.errors);
      }

      this.setPartial({
        documents: JSON.parse(documentsResp.data),
        documentsLoadState: LoadStates.Succeeded,
      });
    } catch (error) {
      console.error(error);
      this.setPartial({
        documentsLoadState: LoadStates.Failed,
      });
    }
  }

  async loadAnalytics(analyticsFilter: Filters) {
    const { course } = this.props;
    const { analyticsLoadState } = this.state;

    if (analyticsLoadState === LoadStates.Loading) return;

    const filterQueryString = !isEmpty(analyticsFilter)
      ? `?filter=${analyticsFilter}`
      : '';

    try {
      this.setPartial({ analyticsLoadState: LoadStates.Loading });

      const analyticsResp = await ApiHelpers.read(
        `series/${course.id}/data/analysis${filterQueryString}`,
        undefined,
        { contentType: undefined }
      );

      if (!analyticsResp.good) {
        throw new Error(
          Localizer.get('There was an error getting the analytics data')
        );
      }
      if (!isEmpty(analyticsResp.errors)) {
        ErrorUtil.throwErrorMessage(analyticsResp.errors);
      }

      this.setPartial({
        analytics: JSON.parse(analyticsResp.data),
        analyticsLoadState: LoadStates.Succeeded,
      });
    } catch (error) {
      console.error(error);
      this.setPartial({
        analyticsLoadState: LoadStates.Failed,
      });
    }
  }

  returnToMeetingAnalytics() {
    this.setState({
      selectedDocument: null,
      selectedLecture: null,
    });
    this.updateQuery(
      QueryUtility.buildQuery({ lecture: undefined, document: undefined })
    );
  }

  getSelectedLecture() {
    const { lectureId } = this.props;
    if (!lectureId) return null;

    const selectedLecture = this.getCompletedLectures().find(
      (f) => f.id === lectureId
    );
    if (isUndefined(selectedLecture)) return null;
    return selectedLecture;
  }

  getSelectedDocument() {
    const { documentId } = this.props;
    const { documents } = this.state;

    if (!documentId) return null;
    const selectedDocument = documents.find((doc) => doc.id === documentId);

    if (isUndefined(selectedDocument)) return null;
    return selectedDocument;
  }

  getCompletedLectures() {
    const { lectures = [], analytics } = this.state;
    if (!analytics) return [];

    const completed = lectures.filter(
      (l) => l.started != null && l.ended != null
    );

    return LecturesUtil.sortedByDate(
      completed.filter(
        (f) =>
          !!analytics.lectureAnalyses.filter((la) => la.lectureId === f.id)[0]
      ),
      false
    );
  }

  selectLecture(lec: ILecture) {
    this.setPartial({
      selectedLecture: lec,
      selectedDocument: null,
    });
    this.updateQuery(
      QueryUtility.buildQuery({ lecture: lec.id, document: undefined })
    );
  }

  selectDocument(doc: IDocument) {
    this.setPartial({
      selectedDocument: doc,
      selectedLecture: null,
    });
    this.updateQuery(
      QueryUtility.buildQuery({ document: doc.id, lecture: undefined })
    );
  }

  performRender() {
    const { course, isDepartment, userInformation } = this.props;
    const {
      lecturesLoadState,
      analyticsLoadState,
      documentsLoadState,
      documents,
      analytics,
      selectedLecture,
      selectedDocument,
    } = this.state;
    const completedLectures = this.getCompletedLectures();
    const userTimezone = userInformation.toJS().timezone;

    return (
      <div className="course-analytics">
        <AnalyticsFilterMultiRadioToggler
          isVisible
          onFilterToggled={(value) => this.loadAnalytics(value)}
          titleNode={
            <h3>
              <Breadcrumb>
                <BreadcrumbLink
                  linkEnabled={
                    !isNull(selectedLecture) || !isNull(selectedDocument)
                  }
                  onClick={() => this.returnToMeetingAnalytics()}
                >
                  {Localizer.getFormatted(COURSE_ANALYTICS_COMPONENT.TITLE)}
                </BreadcrumbLink>
                {!isNull(selectedLecture) ? selectedLecture.name : null}
                {!isNull(selectedDocument) ? selectedDocument.fileName : null}
              </Breadcrumb>
            </h3>
          }
        />

        {lecturesLoadState !== LoadStates.Succeeded && (
          <div className="py-2">
            <LoadIndicator
              state={lecturesLoadState}
              loadingMessage={Localizer.getFormatted(
                COURSE_ANALYTICS_COMPONENT.LOADING
              )}
              errorMessage={Localizer.getFormatted(
                COURSE_ANALYTICS_COMPONENT.LECTURES_ERROR
              )}
              alertClassName="alert-danger"
            />
          </div>
        )}
        {documentsLoadState !== LoadStates.Succeeded && (
          <div className="py-2">
            <LoadIndicator
              state={lecturesLoadState}
              loadingMessage={Localizer.getFormatted(
                COURSE_ANALYTICS_COMPONENT.LOADING
              )}
              errorMessage={Localizer.getFormatted(
                COURSE_ANALYTICS_COMPONENT.DOCUMENTS_ERROR
              )}
              alertClassName="alert-danger"
            />
          </div>
        )}
        {analyticsLoadState !== LoadStates.Succeeded && (
          <div className="py-2">
            <LoadIndicator
              state={analyticsLoadState}
              loadingMessage={Localizer.getFormatted(
                COURSE_ANALYTICS_COMPONENT.LOADING
              )}
              errorMessage={Localizer.getFormatted(
                COURSE_ANALYTICS_COMPONENT.ANALYTICS_ERROR
              )}
              alertClassName="alert-info"
            />
          </div>
        )}

        {lecturesLoadState === LoadStates.Succeeded &&
          analyticsLoadState === LoadStates.Succeeded && (
            <>
              {/* //** Analytics Overview */}
              {!selectedLecture && !selectedDocument && (
                <>
                  <CourseAnalyticsTrends
                    isDepartment={isDepartment}
                    course={course}
                    lectures={completedLectures}
                    analytics={analytics}
                  />
                  {/* // ** Lectures/Presentations */}
                  <div className="course-analytics-lectures-container">
                    <h4>
                      {Localizer.getFormatted(
                        GENERAL_COMPONENT.LECTURES_PRESENTATIONS
                      )}
                    </h4>
                    {isEmpty(completedLectures) && (
                      <div className="pb-1">
                        <Alert bsStyle="info">
                          {Localizer.getFormatted(
                            COURSE_ANALYTICS_COMPONENT.NONE
                          )}
                        </Alert>
                      </div>
                    )}
                    {LecturesUtil.sortedByDate(completedLectures).map((lec) => (
                      <DrilldownMenuItem
                        key={lec.id}
                        onClick={() => this.selectLecture(lec)}
                        title={LecturesUtil.fallbackName(lec)}
                        subtitle={DateFormatUtil.getUnixToGivenTimezone(
                          lec.started,
                          userTimezone,
                          verboseDateTimeFormat
                        )}
                      />
                    ))}
                  </div>
                  {/* // ** Documents */}
                  <div className="course-analytics-documents-container mb-2">
                    <h4>
                      {Localizer.getFormatted(GENERAL_COMPONENT.DOCUMENTS)}
                    </h4>
                    {!isEmpty(documents) ? (
                      <>
                        {documents.map((doc) => (
                          <DrilldownMenuItem
                            key={doc.id}
                            onClick={() => this.selectDocument(doc)}
                            title={doc.fileName}
                            subtitle={DateFormatUtil.getUnixToGivenTimezone(
                              doc.created,
                              userTimezone,
                              verboseDateTimeFormat
                            )}
                          />
                        ))}
                      </>
                    ) : (
                      <Alert bsStyle="info">
                        {Localizer.getFormatted(
                          COURSE_ANALYTICS_COMPONENT.NO_DOCUMENTS
                        )}
                      </Alert>
                    )}
                  </div>
                </>
              )}

              {/* //** Lecture Analytics Drilldown  */}
              {!isEmpty(completedLectures) && selectedLecture && (
                <LectureAnalytics
                  course={course}
                  selectedLecture={selectedLecture}
                  analytics={analytics}
                />
              )}

              {/* //** Document Analytics Drilldown  */}
              {selectedDocument && (
                <CourseAnalyticsDocumentTable
                  selectedDocument={selectedDocument}
                  analytics={analytics}
                />
              )}
            </>
          )}
      </div>
    );
  }
}

export default connect<
  IConnectedCourseAnalyticsProps,
  {},
  ICourseAnalyticsProps
>(AppMappers.AppMapper)(CourseAnalytics);
