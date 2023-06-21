import * as React from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { Alert } from 'react-bootstrap';
import { FaCommentAlt, FaBook, FaDownload } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadIndicator,
  LoadMask,
  LoadStates,
} from 'react-strontium';
import {
  LECTURE_REVIEWER_COMPONENT,
  GENERAL_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ILecture from '../../models/ILecture';
import AppMappers from '../../mappers/AppMappers';
import MenuView from '../controls/MenuView';
import MenuNavItem from '../controls/MenuNavItem';
import LectureQuestionsCountBadge from './LectureQuestionsCountBadge';
import LectureQuestionsReviewer from './LectureQuestionsReviewer';
import CoursePostPresentation from './CoursePostPresentation';
import ICourse from '../../models/ICourse';
import SharePermission from '../../enums/SharePermission';
import Link from '../controls/Link';
import SeriesMetadata from '../shared/SeriesMetadata';

interface IConnectedLectureReviewerProps {
  isCorpVersion?: boolean;
}
interface ILectureReviewerProps {
  course: ICourse;
  lecture: ILecture;
  initialSlide: number;
}

interface ILectureReviewerState {
  loading: LoadStates;
  currentMenu: string;
}

class LectureReviewer extends SrUiComponent<
  ILectureReviewerProps & IConnectedLectureReviewerProps,
  ILectureReviewerState
> {
  initialState(): ILectureReviewerState {
    return { loading: LoadStates.Unloaded, currentMenu: 'review' };
  }

  performRender() {
    const {
      isCorpVersion,
      initialSlide,
      course,
      course: { sharePermission },
      lecture,
    } = this.props;
    const { loading } = this.state;
    const sharingAllowed =
      !isCorpVersion ||
      (isCorpVersion && sharePermission === SharePermission.Open);
    const hasLectureSlideData = !isEmpty(lecture.slideData);

    return (
      <>
        <div className="lecture-reviewer">
          <div className="meta-controls">
            {isCorpVersion && (
              <div className="metadata-container mb-2">
                <SeriesMetadata
                  series={course}
                  presentation={lecture}
                  hasPresentations={!!lecture}
                  hasDocuments={!isEmpty(course.documents)}
                />
              </div>
            )}
            <div className="link-container">
              <Link
                className={`export-notes-button btn btn-success align-self-start`}
                target="_blank"
                rel="noopener noreferrer"
                href={`/print/export/${lecture.seriesId}/${lecture.id}`}
                disabled={!sharingAllowed}
                disabledTooltipMessage={`Sharing is Restricted`}
              >
                <>
                  <FaDownload />{' '}
                  <span className="ml-1">
                    {Localizer.getFormatted(LECTURE_REVIEWER_COMPONENT.EXPORT)}
                  </span>
                </>
              </Link>
            </div>
          </div>

          {hasLectureSlideData ? (
            <MenuView
              horizontal
              onNavItemSelected={(id) => {
                this.setPartial({ currentMenu: id });
              }}
              currentSelection={this.state.currentMenu}
            >
              <MenuNavItem
                id="review"
                content={() => (
                  <CoursePostPresentation
                    initialSlide={initialSlide}
                    key={lecture.id}
                    course={course}
                    lecture={lecture}
                  />
                )}
              >
                <FaBook />
                <span>
                  {Localizer.getFormatted(
                    LECTURE_REVIEWER_COMPONENT.SEGMENT_REVIEW
                  )}
                </span>
              </MenuNavItem>
              <MenuNavItem
                id="questions"
                content={() => <LectureQuestionsReviewer lecture={lecture} />}
              >
                <FaCommentAlt />
                <span>{Localizer.get('Q & A')}</span>{' '}
                <LectureQuestionsCountBadge lecture={lecture} />
              </MenuNavItem>
            </MenuView>
          ) : (
            <Alert bsStyle="info">
              {Localizer.getFormatted(
                GENERAL_COMPONENT.NO_PRESENTATION_LECTURE_PRESENTATION
              )}
            </Alert>
          )}

          <LoadMask state={loading} />
        </div>
        <LoadIndicator
          state={loading}
          loadingMessage={Localizer.get('Getting your notes...')}
        />
      </>
    );
  }
}

export default connect<
  IConnectedLectureReviewerProps,
  {},
  ILectureReviewerProps
>(AppMappers.VersionMapper)(LectureReviewer);
