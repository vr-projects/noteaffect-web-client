import * as React from 'react';
import { SrUiComponent, LoadStates, QueryUtility } from 'react-strontium';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import LecturesUtil from '../../utilities/LecturesUtil';

interface ILectureEngagementListProps {
  course: ICourse;
  lectureId: number;
  lectures: ILecture[];
  loading: LoadStates;
}

interface ILectureEngagementListState {}

export default class LectureEngagementList extends SrUiComponent<
  ILectureEngagementListProps,
  ILectureEngagementListState
> {
  initialState() {
    return {
      lectures: [],
      analytics: null,
      overviews: null,
      loading: LoadStates.Unloaded,
    };
  }

  selectLecture(lec: ILecture) {
    this.updateQuery(QueryUtility.buildQuery({ lecture: lec.id }));
  }

  performRender() {
    const { loading, lectureId, lectures } = this.props;
    if (loading !== LoadStates.Succeeded || lectureId) return null;

    return (
      <div className="lecture-engagement-list">
        <hr />
        <h4>
          {Localizer.getFormatted(GENERAL_COMPONENT.LECTURES_PRESENTATIONS)}
        </h4>
        {LecturesUtil.sortedByDate(lectures).map((lec) => (
          <div
            key={lec.id}
            className={'list-menu-item'}
            onClick={() => this.selectLecture(lec)}
          >
            {/* // TODO tech debt, repeated code, div > button -- refactor to new card design*/}
            <p className="list-menu-title">{LecturesUtil.fallbackName(lec)}</p>
            <p className="sub-title">{LecturesUtil.formattedStart(lec)}</p>
          </div>
        ))}
      </div>
    );
  }
}
