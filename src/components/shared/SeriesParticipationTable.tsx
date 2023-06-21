import React from 'react';
import isNull from 'lodash/isNull';
import { SrUiComponent } from 'react-strontium';
import { GENERAL_TABLES } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ColorUtils from '../../utilities/ColorUtils';
import EngagementUtils from '../../utilities/EngagementUtils';
import IStudentOverview from '../../interfaces/IStudentOverview';
import ILecture from '../../models/ILecture';

interface ISeriesParticipationTableProps {
  overview: IStudentOverview | null;
  filteredLectures: ILecture[] | null;
  className?: string;
}

interface ISeriesParticipationTableState {}

class SeriesParticipationTable extends SrUiComponent<
  ISeriesParticipationTableProps,
  ISeriesParticipationTableState
> {
  getRanking(value: number, participated: boolean) {
    return EngagementUtils.percentileRanking(value, participated);
  }

  seriesHasQuestions(overview): boolean {
    if (isNull(overview)) return false;
    return (
      overview.questionsAnswered +
        overview.questionsNotAnswered +
        overview.questionsMissed >
      0
    );
  }

  performRender() {
    const { overview, filteredLectures, className = '' } = this.props;

    if (isNull(overview)) return null;

    return (
      <div className={`series-participation-table ${className}`}>
        <h4>
          {Localizer.getFormatted(GENERAL_TABLES.COURSE_MEETING_PARTICIPATION)}
        </h4>
        <div className="na-table-wrapper">
          <table className="analytics-table margin margin-top-md">
            <thead>
              <tr>
                <th>
                  {Localizer.getFormatted(
                    GENERAL_TABLES.LECTURES_PRESENTATIONS_VIEWED
                  )}
                </th>
                <th>{Localizer.get('Segments viewed')}</th>
                <th>{Localizer.get('Segments with notes taken')}</th>
                <th>{Localizer.get('Segments with annotations made')}</th>
                <th>{Localizer.get('Viewing Participation')}</th>
                <th>{Localizer.get('Note-taking Participation')}</th>
                <th>{Localizer.get('Annotating Participation')}</th>
                <th>{Localizer.get('Poll Answering Participation')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {`${
                    overview.lectureOverviews.filter((l) => l.participated)
                      .length
                  } of ${filteredLectures.length}`}
                </td>
                {overview.participated ? (
                  <>
                    <td>
                      {overview.slidesViewed} of {overview.slides}
                    </td>
                    <td>{overview.slidesNoted}</td>
                    <td>{overview.slidesAnnotated}</td>
                    <td
                      style={{
                        color: ColorUtils.valueToRedGreenRgbStyle(
                          overview.viewedPercentile / 100.0
                        ),
                      }}
                    >
                      {this.getRanking(
                        overview.viewedPercentile,
                        overview.participated
                      )}
                    </td>
                    <td
                      style={{
                        color: ColorUtils.valueToRedGreenRgbStyle(
                          overview.notedPercentile / 100.0
                        ),
                      }}
                    >
                      {this.getRanking(
                        overview.notedPercentile,
                        overview.participated
                      )}
                    </td>
                    <td
                      style={{
                        color: ColorUtils.valueToRedGreenRgbStyle(
                          overview.annotatedPercentile / 100.0
                        ),
                      }}
                    >
                      {this.getRanking(
                        overview.annotatedPercentile,
                        overview.participated
                      )}
                    </td>
                    {this.seriesHasQuestions(overview) ? (
                      <td
                        style={{
                          color: ColorUtils.valueToRedGreenRgbStyle(
                            overview.questionsAnsweredPercentile / 100.0
                          ),
                        }}
                      >
                        {this.getRanking(
                          overview.questionsAnsweredPercentile,
                          overview.participated
                        )}
                      </td>
                    ) : (
                      <td>{'No polls asked'}</td>
                    )}
                  </>
                ) : (
                  <td colSpan={7}>{Localizer.get('Did not participate')}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default SeriesParticipationTable;
