// TODO refactor out, put in shared

import * as React from 'react';
import { SrUiComponent, QueryUtility, Animated } from 'react-strontium';
import InstructorLectureDetail from './InstructorLectureDetail';
import moment from 'moment';
import ICourse from '../../../models/ICourse';
import ILecture from '../../../models/ILecture';
import { GENERAL_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import LectureSearchAndSort from '../../controls/LectureSearchAndSort';
import Lectures from '../../../utilities/LecturesUtil';

interface ICourseLecturesLayoutProps {
  course: ICourse;
  lectures: ILecture[];
  selectedId: number;
  initialSlide: number;
}

interface ICourseLecturesLayoutState {
  filter: string;
  orderBy: string;
}

export default class InstructorCourseLecturesLayout extends SrUiComponent<
  ICourseLecturesLayoutProps,
  ICourseLecturesLayoutState
> {
  initialState() {
    return { filter: '', orderBy: 'Date' };
  }

  filteredLectures() {
    let lectures = this.props.lectures;
    if ((this.state.filter || '').trim().length !== 0) {
      {
        lectures = this.props.lectures.filter(
          (l) =>
            (l.name || 'Unnamed Lecture')
              .toLowerCase()
              .indexOf(this.state.filter) !== -1
        );
      }
    }

    if (this.state.orderBy === 'Name') {
      return Lectures.sortedByName(lectures);
    } else {
      return Lectures.sortedByDate(lectures);
    }
  }

  selectedLecture() {
    if (!this.props.selectedId) {
      return this.props.lectures[0];
    }

    return this.props.lectures.find((f) => f.id === this.props.selectedId);
  }

  selectedId() {
    let lecture = this.selectedLecture();
    if (!lecture) {
      return '';
    }
    return lecture.id;
  }

  selectLecture(lec: ILecture) {
    this.updateQuery(QueryUtility.buildQuery({ lecture: lec.id }));
  }

  performRender() {
    return (
      <div className="course-lectures-layout">
        {this.props.selectedId ? (
          <div>
            <Animated in key={this.selectedId() || 'none-selected'}>
              <InstructorLectureDetail
                lecture={this.selectedLecture()}
                course={this.props.course}
                initialSlide={this.props.initialSlide}
              />
            </Animated>
          </div>
        ) : (
          <>
            <LectureSearchAndSort
              filterBy={this.state.filter}
              orderBy={this.state.orderBy}
              onFilterChange={(e) => this.setPartial({ filter: e })}
              onSortChange={(e) => this.setPartial({ orderBy: e })}
            />
            <hr />
            {this.filteredLectures().map((lec) => (
              <div
                key={lec.id}
                className={
                  'list-menu-item ' +
                  (this.selectedId() === lec.id ? 'selected' : '')
                }
                onClick={() => this.selectLecture(lec)}
              >
                {/* // TODO tech debt refactor repeated, div > button */}
                <p className="list-menu-title">
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
                <p className="sub-title">
                  {lec.started
                    ? moment(lec.started * 1000).format(
                        'dddd, MMM Do YYYY, hh:mma'
                      )
                    : Localizer.get('Not started')}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }
}
