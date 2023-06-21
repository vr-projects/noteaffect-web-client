import IQuestionType from '../models/IQuestionType';
import IQuestionViewType from '../models/IQuestionViewType';

export default class LiveQuestions {
  public static viewTypesForQuestionType(
    questionType: IQuestionType,
    viewTypes: IQuestionViewType[]
  ) {
    const finalViewTypes: IQuestionViewType[] = [
      { id: undefined, type: 'No visualization' },
    ];
    switch (questionType.type) {
      case 'Single choice':
      case 'Multiple choice':
        finalViewTypes.push(viewTypes.find((vt) => vt.type === 'Pie Chart'));
        finalViewTypes.push(viewTypes.find((vt) => vt.type === 'Bar Chart'));
        break;
      case 'Rating':
        finalViewTypes.push(viewTypes.find((vt) => vt.type === 'Average'));
        break;
      case 'Freeform text entry':
        // finalViewTypes.push(viewTypes.find(vt => vt.type === 'Top Answers'));
        finalViewTypes.push(viewTypes.find((vt) => vt.type === 'Word Cloud'));
        break;
    }

    return finalViewTypes;
  }
}
