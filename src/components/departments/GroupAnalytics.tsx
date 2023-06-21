import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, LoadStates, ApiHelpers } from 'react-strontium';
import isEmpty from 'lodash/isEmpty';
import ICourse from '../../models/ICourse';
import { GROUP_ANALYTICS_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IGroupAnalysis from '../../interfaces/IGroupAnalysis';
import GroupAnalyticsTrends from './GroupAnalyticsTrends';
import AnalyticsFilterMultiRadioToggler from 'components/controls/AnalyticsFilterMultiRadioToggler';
import Filters from '../../enums/Filters';

interface IGroupAnalyticsProps {
  groupId: number;
  groupType: string;
  periodId?: number;
  courseId?: number;
  lectureId?: number;
  courses: ICourse[];
}

interface IGroupAnalyticsState {
  analytics: IGroupAnalysis;
  loading: LoadStates;
}

export default class GroupAnalytics extends SrUiComponent<
  IGroupAnalyticsProps,
  IGroupAnalyticsState
> {
  initialState(): IGroupAnalyticsState {
    return { analytics: null, loading: LoadStates.Unloaded };
  }

  onComponentMounted() {
    this.loadData(Filters.DefaultAnalyticsFilter);
  }

  async loadData(analyticsFilter: string) {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    let periodAddition = '';
    if (!!this.props.periodId && this.props.groupType !== 'Period') {
      periodAddition = `/${this.props.periodId}`;
    }

    const filterQueryString = !isEmpty(analyticsFilter)
      ? `?filter=${analyticsFilter}`
      : '';

    const analyticsResp = await ApiHelpers.read(
      `analytics/${this.props.groupType}/${this.props.groupId}${periodAddition}${filterQueryString}`,
      undefined,
      { contentType: undefined }
    );

    if (!analyticsResp.good) {
      this.setPartial({ loading: LoadStates.Failed });
      return;
    }

    this.set({
      analytics: JSON.parse(analyticsResp.data),
      loading: LoadStates.Succeeded,
    });
  }

  performRender() {
    return (
      <div className="course-analytics">
        <AnalyticsFilterMultiRadioToggler
          onFilterToggled={(value) => this.loadData(value)}
          isVisible={true}
          titleNode={
            <h4>{Localizer.get(this.props.groupType + ' Analytics')}</h4>
          }
        />
        <p className="helper-message">
          {Localizer.get(
            'Analytics results do not reflect anything you have entered in the search box.'
          )}
        </p>
        {this.state.analytics ? (
          // TODO tech debt find empty bool if from API or custom Strontium
          this.state.analytics.empty ? (
            <Alert bsStyle="info">
              {Localizer.getFormatted(
                GROUP_ANALYTICS_COMPONENT.NO_PRESENTATIONS
              )}
            </Alert>
          ) : (
            // TODO tech debt confirm state passed in as props or blackbox
            <GroupAnalyticsTrends {...this.props} {...this.state} />
          )
        ) : null}
      </div>
    );
  }
}
