import * as React from 'react';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import { connect, DispatchProp } from 'react-redux';
import { BsBellFill } from 'react-icons/bs';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  QueryUtility,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import ICourse from '../../../models/ICourse';
import ISecurityReport from '../../../models/ISecurityReport';
import ILecture from '../../../models/ILecture';
import IImmutableObject from '../../../interfaces/IImmutableObject';
import IUserInformation from '../../../interfaces/IUserInformation';
import {
  COURSE_SECURITY_EVENTS,
  GENERAL_COMPONENT,
} from '../../../version/versionConstants';
import AppMappers from '../../../mappers/AppMappers';
import ErrorUtil from '../../../utilities/ErrorUtil';
import Localizer from '../../../utilities/Localizer';
import DateFormatUtil, {
  verboseDateTimeFormat,
} from '../../../utilities/DateFormatUtil';
import AccessibilityUtil from '../../../utilities/AccessibilityUtil';
import LecturesUtil from '../../../utilities/LecturesUtil';
import SecurityReport, { SecurityReportType } from './SecurityReport';
import BreadcrumbLink from '../../controls/BreadcrumbLink';
import Breadcrumb from '../../controls/Breadcrumb';

interface IConnectedCourseSecurityEventsProps extends DispatchProp<any> {
  userInformation?: IImmutableObject<IUserInformation>; // required for user timezone to update
}

interface ICourseSecurityEventsProps {
  course: ICourse;
  lectureId: number;
  query: any;
  menu: any;
}

interface ICourseSecurityEventsState {
  completedLectures: ILecture[];
  loading: LoadStates;
  selectedLecture: ILecture;
  selectedDocuments: boolean;
  selectedBreadcrumb: string; // presentation name or 'Documents'
  securityReport: ISecurityReport[];
  rawLectureViolations: ISecurityReport[];
  selectedLectureViolations: ISecurityReport[];
  rawDocumentViolations: ISecurityReport[];
}

class CourseSecurityEvents extends SrUiComponent<
  IConnectedCourseSecurityEventsProps & ICourseSecurityEventsProps,
  ICourseSecurityEventsState
> {
  initialState() {
    return {
      completedLectures: [],
      loading: LoadStates.Unloaded,
      selectedLecture: null,
      selectedDocuments: null,
      selectedBreadcrumb: null,
      securityReport: [],
      rawLectureViolations: [],
      selectedLectureViolations: [],
      rawDocumentViolations: [],
    };
  }

  async onComponentMounted() {
    await this.loadData();
    this.handleUrlParams();
  }

  handleUrlParams() {
    const {
      query: { documents, lecture },
    } = this.props;

    switch (true) {
      case !isUndefined(lecture):
        return this.selectLecture(Number(lecture));
      case !isUndefined(documents):
        return this.selectDocuments();
      default:
        return;
    }
  }

  async loadData(resetSelectedLectureId?: number) {
    const {
      course: { id: seriesId },
    } = this.props;
    const { loading, selectedLecture } = this.state;

    if (loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({
      loading: LoadStates.Loading,
    });

    const promises = [
      ApiHelpers.read(`series/${seriesId}/lectures`),
      ApiHelpers.read(`security/${seriesId}/violationReport`),
    ];

    await Promise.all(promises)
      .then((responses) => {
        const lecturesResp = responses.find((res) =>
          res.action.includes('lectures')
        );
        const securityReportResp = responses.find((res) =>
          res.action.includes('violationReport')
        );

        ErrorUtil.handleAPIErrors(
          lecturesResp,
          Localizer.get('There was an error retrieving presentation data')
        );

        ErrorUtil.handleAPIErrors(
          securityReportResp,
          Localizer.get('There was an error retrieving security violation data')
        );

        const lectures = JSON.parse(lecturesResp.data);
        const securityReport = JSON.parse(securityReportResp.data);

        securityReport.sort((a, b) => {
          const dateA: any = new Date(a.dateOccurred);
          const dateB: any = new Date(b.dateOccurred);
          return dateB - dateA;
        });

        const rawLectureViolations = securityReport.filter(
          (violation) => violation.resourceType === 'Slide'
        );
        const rawDocumentViolations = securityReport.filter(
          (violation) => violation.resourceType === 'UserFile'
        );

        const completedLectures = this.getCompletedLectures(lectures);

        this.setPartial({
          loading: LoadStates.Succeeded,
          completedLectures,
          securityReport,
          rawLectureViolations,
          rawDocumentViolations,
        });

        // Handle re-selecting lecture after acknowledge, refresh lists
        if (!isUndefined(resetSelectedLectureId)) {
          this.selectLecture(resetSelectedLectureId);
        }
      })
      .catch((error) => {
        console.error(error);
        this.setPartial({
          loading: LoadStates.Failed,
        });
      });
  }

  getSelectedLecture(lectureId) {
    if (!lectureId) {
      return null;
    }
    const { completedLectures } = this.state;

    return this.getCompletedLectures(completedLectures).find(
      (f) => f.id === lectureId
    );
  }

  getCompletedLectures(lectures: ILecture[]) {
    const completed = lectures.filter(
      (l) => l.started != null && l.ended != null
    );
    return LecturesUtil.sortedByDate(
      completed.filter((f) => !!lectures.filter((la) => la.id === f.id)[0]),
      false
    );
  }

  selectLecture(lectureId: number) {
    const { rawLectureViolations } = this.state;
    const selectedLecture = this.getSelectedLecture(lectureId);
    const selectedLectureViolations = rawLectureViolations.filter(
      (violations) => violations.lectureId === lectureId
    );

    this.setPartial({
      selectedLecture,
      selectedDocuments: null,
      selectedLectureViolations,
    });
    this.updateQuery(QueryUtility.buildQuery({ lecture: lectureId }));
  }
  selectDocuments() {
    this.setPartial({
      selectedLecture: null,
      selectedDocuments: true,
      selectedLectureViolations: [],
    });
    this.updateQuery(QueryUtility.buildQuery({ documents: true }));
  }

  returnToSecurityEvents() {
    this.setPartial({ selectedLecture: null, selectedDocuments: null });
    this.updateQuery(
      QueryUtility.buildQuery({ lecture: undefined, documents: undefined })
    );
  }

  getHasUnacknowledgeViolations(lectureId: number) {
    const { rawLectureViolations = [] } = this.state;
    const filteredLectureViolation = rawLectureViolations.filter(
      (violation) => violation.lectureId === lectureId
    );
    if (isEmpty(filteredLectureViolation)) return false;

    return !filteredLectureViolation[0].acknowledged;
  }

  performRender() {
    const { userInformation, course } = this.props;
    const {
      loading,
      selectedLecture,
      selectedDocuments,
      completedLectures,
      rawLectureViolations,
      rawDocumentViolations,
      selectedLectureViolations,
    } = this.state;
    const userTimezone = userInformation.toJS().timezone;
    const pendingDocumentViolations = rawDocumentViolations.filter(
      (v) => !v.acknowledged
    );

    return (
      <div className="security-events">
        <h3>
          <Breadcrumb>
            <BreadcrumbLink
              linkEnabled={
                !isNull(selectedLecture) || !isNull(selectedDocuments)
              }
              onClick={() => this.returnToSecurityEvents()}
            >
              {Localizer.get('Security Events')}
            </BreadcrumbLink>
            {selectedLecture ? selectedLecture.name : null}
            {selectedDocuments ? Localizer.get('Documents') : null}
          </Breadcrumb>
        </h3>

        {loading !== LoadStates.Succeeded && (
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Getting meeting security reports')}
            errorMessage={Localizer.getFormatted(COURSE_SECURITY_EVENTS.ERROR)}
            alertClassName="alert-info"
          />
        )}
        {loading === LoadStates.Succeeded &&
          isEmpty(completedLectures) &&
          isNull(selectedDocuments) && (
            <Alert bsStyle="info">
              {Localizer.get(
                'Security Reports will be available after you have completed one or more presentations.'
              )}
            </Alert>
          )}
        {/* Presentations Button */}
        {loading === LoadStates.Succeeded &&
          !isEmpty(completedLectures) &&
          isNull(selectedLecture) &&
          isNull(selectedDocuments) && (
            <div className="series-presentations-lectures-layout">
              <div className="presentations-lectures">
                {completedLectures.map((lec) => (
                  <div
                    key={lec.id}
                    role="button"
                    tabIndex={0}
                    className={`presentation-lecture`}
                    onClick={() => this.selectLecture(lec.id)}
                    onKeyDown={(e) =>
                      AccessibilityUtil.handleEnterKey(e, () =>
                        this.selectLecture(lec.id)
                      )
                    }
                  >
                    <p className="presentation-lecture-title">
                      {lec.name ||
                        Localizer.getFormatted(
                          GENERAL_COMPONENT.UNNAMED_LECTURE_PRESENTATION
                        )}{' '}
                      {lec.ended ? null : (
                        <span className="label label-info">
                          {Localizer.get('Ongoing')}
                        </span>
                      )}
                      {this.getHasUnacknowledgeViolations(lec.id) && (
                        <BsBellFill className={`text-warning ml-1`} />
                      )}
                    </p>
                    <p className="presentation-lecture-subtitle">
                      {lec.started
                        ? DateFormatUtil.getUnixToGivenTimezone(
                            lec.started,
                            userTimezone,
                            verboseDateTimeFormat
                          )
                        : Localizer.get('Not started')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        {/* Documents Button */}
        {loading === LoadStates.Succeeded &&
          isNull(selectedLecture) &&
          isNull(selectedDocuments) && (
            <div className="series-presentations-lectures-layout">
              <div className="presentations-lectures">
                <div
                  role="button"
                  tabIndex={0}
                  className={`presentation-lecture`}
                  onClick={() => this.selectDocuments()}
                  onKeyDown={(e) =>
                    AccessibilityUtil.handleEnterKey(e, () =>
                      this.selectDocuments()
                    )
                  }
                >
                  <p className="presentation-lecture-title">
                    <span>{Localizer.get('Documents')}</span>
                    {!isEmpty(pendingDocumentViolations) && (
                      <BsBellFill className={`text-warning ml-1`} />
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

        {!isNull(selectedLecture) &&
          rawLectureViolations &&
          !isEmpty(selectedLectureViolations) && (
            <SecurityReport
              seriesId={course.id}
              securityReport={selectedLectureViolations}
              reportType={SecurityReportType.Presentation}
              onShouldUpdate={async () =>
                await this.loadData(selectedLecture.id)
              }
            />
          )}

        {!isNull(selectedDocuments) && rawDocumentViolations && (
          <SecurityReport
            seriesId={course.id}
            securityReport={rawDocumentViolations}
            reportType={SecurityReportType.Documents}
            onShouldUpdate={async () => await this.loadData()}
          />
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedCourseSecurityEventsProps,
  {},
  ICourseSecurityEventsState
>(AppMappers.AppMapper)(CourseSecurityEvents);
