import admin from './admin/AdminReducer';
import app from './app/AppReducer';
import courses from './courses/CoursesReducer';
import departments from './departments/DepartmentsReducer';
import drawableSurface from './drawable_surface/DrawableSurfaceReducer';
import pdf from './pdf/PdfReducer';
import presentation from './presentation/PresentationReducer';
import questions from './questions/QuestionsReducer';
import security from './security/SecurityReducer';

//** names affect how access state[reducerName] */
export {
  admin,
  app,
  courses,
  departments,
  drawableSurface,
  presentation,
  pdf,
  questions,
  security,
};
