import IAnalysisRates from '../interfaces/IAnalysisRates';

export default class EngagementUtils {
  public static weightedEngagement(rates: IAnalysisRates) {
    return (
      this.weightedViewRate(rates) +
      this.weightedNoteRate(rates) +
      this.weightedAnnotationRate(rates)
    );
  }

  public static weightedViewRate(rates: IAnalysisRates) {
    return rates.viewRate * 0.8;
  }

  public static weightedNoteRate(rates: IAnalysisRates) {
    return rates.noteRate * 0.1;
  }

  public static weightedAnnotationRate(rates: IAnalysisRates) {
    return rates.annotationRate * 0.1;
  }

  public static percentileRanking(value: number, participated: boolean = true) {
    if (!participated) {
      return 'Did not participate';
    }
    if (value < 50) {
      return 'Bottom 50%';
    } else {
      return `Top ${Math.round(100 - value)}%`;
    }
  }
}
