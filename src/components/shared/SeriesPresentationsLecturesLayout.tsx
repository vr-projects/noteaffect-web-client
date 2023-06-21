import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, QueryUtility, Animated } from 'react-strontium';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import PresentationLectureDetail from './PresentationLectureDetail';
import moment from 'moment';
import Lectures from '../../utilities/LecturesUtil';
import LectureSearchAndSort from '../controls/LectureSearchAndSort';
import AccessibilityUtil from '../../utilities/AccessibilityUtil';

interface ISeriesPresentationLecturesLayoutProps {
  course: ICourse;
  lectures: ILecture[];
  lectureId: number;
  initialSlide: number;
  isLecturerView: boolean;
}

interface ISeriesPresentationLecturesLayoutState {
  filterBy: string;
  orderBy: string;
}

export default class SeriesPresentationLecturesLayout extends SrUiComponent<
  ISeriesPresentationLecturesLayoutProps,
  ISeriesPresentationLecturesLayoutState
> {
  initialState() {
    return { filterBy: '', orderBy: 'Date' };
  }

  getFilteredLectures() {
    const { lectures } = this.props;
    const { filterBy, orderBy } = this.state;

    const copiedLectures = [...lectures];
    const filteredLectures = isEmpty(filterBy)
      ? copiedLectures
      : copiedLectures.filter((lecture) => {
          return (lecture.name || 'Unnamed Lecture')
            .toLowerCase()
            .includes(filterBy);
        });

    return orderBy === 'Name'
      ? Lectures.sortedByName(filteredLectures)
      : Lectures.sortedByDate(filteredLectures);
  }

  getSelectedLecture() {
    const { lectureId, lectures } = this.props;

    if (!lectureId) {
      return lectures[0];
    }

    return lectures.find((lec) => lec.id === lectureId);
  }

  selectedId() {
    let lecture = this.getSelectedLecture();
    if (!lecture) {
      return null;
    }
    return lecture.id;
  }

  selectLecture(lec: ILecture) {
    this.updateQuery(QueryUtility.buildQuery({ lecture: lec.id }));
  }

  performRender() {
    const { lectureId, course, initialSlide, isLecturerView } = this.props;
    const { filterBy, orderBy } = this.state;
    const filteredLectures = this.getFilteredLectures();

    return (
      <div className="series-presentations-lectures-layout">
        {lectureId ? (
          <div>
            <Animated in key={this.selectedId() || 'none-selected'}>
              <PresentationLectureDetail
                lecture={this.getSelectedLecture()}
                course={course}
                initialSlide={initialSlide}
                isLecturerView={isLecturerView}
              />
            </Animated>
          </div>
        ) : (
          <>
            <LectureSearchAndSort
              filterBy={filterBy}
              orderBy={orderBy}
              onFilterChange={(e) => this.setPartial({ filterBy: e })}
              onSortChange={(e) => this.setPartial({ orderBy: e })}
            />
            <hr />

            {!isEmpty(filteredLectures) ? (
              <div className="presentations-lectures">
                {filteredLectures.map((lec) => (
                  <div
                    key={lec.id}
                    role="button"
                    tabIndex={0}
                    className={`presentation-lecture`}
                    onClick={() => this.selectLecture(lec)}
                    onKeyDown={(e) =>
                      AccessibilityUtil.handleEnterKey(e, () =>
                        this.selectLecture(lec)
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
                    </p>
                    <p className="presentation-lecture-subtitle">
                      {lec.started
                        ? moment(lec.started * 1000).format(
                            'dddd, MMM Do YYYY, hh:mma'
                          )
                        : Localizer.get('Not started')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Animated in>
                  <Alert bsStyle="warning">
                    {Localizer.get(
                      'There are no results for this filter, please try searching for another name'
                    )}
                  </Alert>
                </Animated>
              </>
            )}
          </>
        )}
      </div>
    );
  }
}
