import * as React from 'react';
import { connect } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import * as AppActions from '../../store/app/AppActions';
import IQuestionBuilderProps from '../../interfaces/IQuestionBuilderProps';
import QuestionBuilderDetail from '../questions/QuestionBuilderDetail';
import QuestionMappers from '../../mappers/QuestionMappers';
import * as QuestionActions from '../../store/questions/QuestionsActions';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IQuestionBuilderGuardProps {}

interface IQuestionBuilderGuardState {}

class QuestionBuilderGuard extends SrUiComponent<
  IQuestionBuilderGuardProps & IQuestionBuilderProps,
  IQuestionBuilderGuardState
> {
  onComponentMounted() {
    this.props.dispatch(AppActions.changeMenu('instructor/questions'));
    this.checkAllowed(this.props);
    this.props.dispatch(QuestionActions.loadData());
  }

  onNewProps(props: IQuestionBuilderProps) {
    this.checkAllowed(props);
  }

  checkAllowed(props: IQuestionBuilderProps) {
    if (!props.userPermissions || props.userPermissions.size === 0) {
      return;
    }

    if (
      !SystemRoleService.hasSomeRoles([
        SystemRoles.PRESENTER,
        SystemRoles.SALES_PRESENTER,
        SystemRoles.DEPARTMENT_ADMIN,
        SystemRoles.CLIENT_ADMIN,
        SystemRoles.ADMIN,
      ])
    ) {
      this.navigate('dashboard');
    }
  }

  performRender() {
    return (
      <QuestionBuilderDetail
        menu={this.props.menu}
        questions={this.props.questions}
        options={this.props.options}
        loading={this.props.loading}
        creating={this.props.creating}
      />
    );
  }
}

export default connect<
  any,
  void,
  IQuestionBuilderGuardProps & IQuestionBuilderProps
>(QuestionMappers.QuestionMapper)(QuestionBuilderGuard);
