import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { Table, Alert } from 'react-bootstrap';
import IDocument from '../../models/IDocument';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';
import Localizer from '../../utilities/Localizer';

interface ICourseAnalyticsDocumentTableProps {
  selectedDocument: IDocument;
  analytics: ISeriesAnalysis;
}

const CourseAnalyticsDocumentTable = ({
  selectedDocument,
  analytics,
}: ICourseAnalyticsDocumentTableProps) => {
  const { documentAnalyses = [] } = analytics;
  const documentAnalysis = !isEmpty(documentAnalyses)
    ? documentAnalyses.find((da) => da.userFileId === selectedDocument.id)
    : null;
  const documentPageAnalyses = !isNull(documentAnalysis)
    ? documentAnalysis.documentPageAnalyses
    : [];

  return (
    <div className="course-analytics-document-table analytics-table mt-3">
      <Table>
        <thead>
          <tr>
            <th>{Localizer.get('Page')}</th>
            <th>{Localizer.get('Unique views')}</th>
            <th>{Localizer.get('Notes taken')}</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty(documentPageAnalyses) ? (
            <tr>
              <td colSpan={4}>
                <Alert bsStyle="info">
                  {Localizer.get('There is no data for this document.')}
                </Alert>
              </td>
            </tr>
          ) : (
            documentPageAnalyses.map((page) => (
              <tr key={`page-analysis-${page.pageNumber}`}>
                <td>{page.pageNumber}</td>
                <td>{page.documentPageUniqueViews}</td>
                <td>{page.documentPageNotesTaken}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CourseAnalyticsDocumentTable;
