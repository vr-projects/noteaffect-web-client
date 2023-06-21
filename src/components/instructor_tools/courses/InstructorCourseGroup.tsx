import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, Animated } from 'react-strontium';
import isNull from 'lodash/isNull';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import ICourse from '../../../models/ICourse';
import Localizer from '../../../utilities/Localizer';
import InstructorCourseItem from './InstructorCourseItem';

interface IInstructorCourseGroupProps {
  isCorpVersion?: boolean;
  courses: ICourse[];
  groupName: string;
  sortBy: string | null;
  searchFilterInputValue: string;
  className?: string;
}

interface IInstructorCourseGroupState {}

class InstructorCourseGroup extends SrUiComponent<
  IInstructorCourseGroupProps,
  IInstructorCourseGroupState
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
    const filteredCourses = this.filteredCourses();

    if (courses.length === 0) {
      return null;
    }

    return (
      <div
        className={`instructor-course-group course-group ${
          isCorpVersion ? 'isCorp' : ''
        } ${className ? className : ''}`}
      >
        <h2>{Localizer.get(this.props.groupName)}</h2>
        {filteredCourses.length > 0 ? (
          <div className="instructor-course-group-grid">
            {filteredCourses.map((c) => (
              <InstructorCourseItem key={c.id} course={c} />
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
    );
  }
}

export default InstructorCourseGroup;
