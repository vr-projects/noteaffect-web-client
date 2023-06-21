import SeriesState from '../enums/SeriesState';

export default class Courses {
  private static _allowedToOpen: SeriesState[] = [
    SeriesState.Current,
    SeriesState.EndedOpen,
    SeriesState.Live,
    SeriesState.UpcomingOpen,
  ];

  public static accessAllowed(state: SeriesState): boolean {
    return this._allowedToOpen.indexOf(state) !== -1;
  }
}
