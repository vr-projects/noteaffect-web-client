import * as React from 'react';
import { SrUiComponent, Animated } from 'react-strontium';
import ICourse from '../../models/ICourse';
import Localizer from '../../utilities/Localizer';
import SeriesState from '../../enums/SeriesState';
import CourseItem from './CourseItem';
import { Alert } from 'react-bootstrap';
import isNull from 'lodash/isNull';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';

interface ICourseGroupProps {
  state?: SeriesState[];
  isCorpVersion?: boolean;
  courses: ICourse[];
  groupName: string;
  sortBy?: string | null;
  searchFilterInputValue?: string;
  className?: string;
}

interface ICourseGroupState {}

export default class CourseGroup extends SrUiComponent<
  ICourseGroupProps,
  ICourseGroupState
> {
  filteredCourses() {
    const { sortBy, searchFilterInputValue } = this.props;
    const sortBySelected = !isNull(sortBy) ? sortBy : 'courseStart';

    return this.props.courses
      .filter((course) => {
        // return all results when no text in search input
        if (searchFilterInputValue.length === 0) return true;
        return (
          course.name
            .toLowerCase()
            .includes(searchFilterInputValue.toLowerCase()) ||
          course.displayId.toLowerCase().includes(searchFilterInputValue)
        );
      })
      .sort((a, b) => {
        if (a.state !== b.state) return a.state - b.state;

        switch (true) {
          case isNull(a['courseStart']):
            console.error('Error with null courseStart');
            break;
          // Sort by Name
          case isString(a[sortBySelected]):
            return a[sortBySelected].localeCompare(b[sortBySelected]);
          // Sort by Meeting ID and Dates
          case isNumber(a[sortBySelected]):
            return b[sortBySelected] - a[sortBySelected];
          default:
            return b[sortBySelected] - a[sortBySelected];
        }
      });
  }

  performRender() {
    const { isCorpVersion, courses, className } = this.props;
    let filteredCourses = [];

    if (isCorpVersion) {
      filteredCourses = this.filteredCourses();
    }
    if (courses.length === 0) {
      return null;
    }

    return (
      <>
        {!isCorpVersion && (
          <div className={'course-group'}>
            <h4 className={'capitalize'}>
              {Localizer.get(this.props.groupName)}
            </h4>
            {courses.map((c) => (
              <CourseItem key={c.id} course={c} />
            ))}
          </div>
        )}
        {isCorpVersion && (
          <div
            className={`instructor-course-group course-group ${
              isCorpVersion ? 'isCorp' : ''
            } ${className ? className : ''}`}
          >
            <h2>{Localizer.get(this.props.groupName)}</h2>
            {filteredCourses.length > 0 ? (
              <div className="instructor-course-group-grid">
                {filteredCourses.map((c) => (
                  <CourseItem key={c.id} course={c} />
                ))}
              </div>
            ) : (
              <Animated in>
                <Alert bsStyle="warning">
                  {Localizer.get('No results found. Try refining your search.')}
                </Alert>
              </Animated>
            )}
          </div>
        )}
      </>
    );
  }
}
