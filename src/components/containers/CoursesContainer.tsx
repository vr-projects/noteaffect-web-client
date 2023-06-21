import * as React from 'react';
import { connect } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import CoursesMappers from '../../mappers/CoursesMappers';
import ICoursesProps from '../../interfaces/ICoursesProps';
import CoursesComponent from '../course/CoursesComponent';
import ICourse from '../../models/ICourse';
import * as CoursesActions from '../../store/courses/CoursesActions';
import * as AppActions from '../../store/app/AppActions';

interface ICourseContainerProps {}

interface ICourseContainerState {}

class CoursesContainer extends SrUiComponent<
  ICourseContainerProps & ICoursesProps,
  ICourseContainerState
> {
  onComponentMounted() {
    this.props.dispatch(AppActions.changeMenu('courses'));
    this.props.dispatch(CoursesActions.getCourses());
  }

  performRender() {
    return (
      <CoursesComponent
        courses={this.props.courses.toJS() as ICourse[]}
        coursesLoading={this.props.coursesLoading}
      />
    );
  }
}

export default connect(CoursesMappers.CoursesMapper)(CoursesContainer);
