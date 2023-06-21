import * as React from 'react';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  ApiHelpers,
} from 'react-strontium';
import isEmpty from 'lodash/isEmpty';
import ICourse from '../../models/ICourse';
import { GROUP_ENGAGEMENT_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IGroupAnalysis from '../../interfaces/IGroupAnalysis';
import GroupEngagementTrends from './GroupEngagementTrends';
import Filters from '../../enums/Filters';
import AnalyticsFilterMultiRadioToggler from 'components/controls/AnalyticsFilterMultiRadioToggler';

interface IGroupEngagementProps {
  groupId: number;
  groupType: string;
  periodId?: number;
  courses: ICourse[];
}

interface ICourseEngagementState {
  analytics: IGroupAnalysis;
  loading: LoadStates;
}

export default class GroupEngagement extends SrUiComponent<
  IGroupEngagementProps,
  ICourseEngagementState
> {
  initialState(): ICourseEngagementState {
    return { analytics: null, loading: LoadStates.Unloaded };
  }

  onComponentMounted() {
    this.loadData(Filters.DefaultAnalyticsFilter);
  }

  async loadData(analyticsFilter: string) {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
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
    const { groupType } = this.props;

    return (
      <div className="course-engagement">
        <AnalyticsFilterMultiRadioToggler
          onFilterToggled={(value) => this.loadData(value)}
          isVisible={true}
          titleNode={<h4>{Localizer.get(groupType + ' Engagement')}</h4>}
        />
        <p className="helper-message">
          {Localizer.get(
            'Engagement results do not reflect anything you have entered in the search box.'
          )}
        </p>
        <LoadIndicator
          state={this.state.loading}
          loadingMessage={Localizer.get('Getting engagement information...')}
          errorMessage={Localizer.getFormatted(
            GROUP_ENGAGEMENT_COMPONENT.ERROR
          )}
        />
        {this.state.analytics ? (
          this.state.analytics.empty ? (
            <Alert bsStyle="info">
              {Localizer.getFormatted(
                GROUP_ENGAGEMENT_COMPONENT.NO_PRESENTATIONS
              )}
            </Alert>
          ) : (
            <GroupEngagementTrends {...this.props} {...this.state} />
          )
        ) : null}
      </div>
    );
  }

  coursesForAnalysis() {
    if (!this.state.analytics) {
      return [];
    }
    return this.props.courses
      .filter(
        (f) =>
          !!this.state.analytics.seriesData.filter(
            (sa) => sa.seriesId === f.id
          )[0]
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
