// Component expects table as child element
// Handles consistent styling of table
// Expects first td to have class .document-name
// Expect last td to have class context-menu-container
import * as React from 'react';

interface IDocumentsTableContainerProps {
  className?: string;
  children: React.ReactNode;
}

const DocumentsTableContainer = ({
  className = '',
  children,
}: IDocumentsTableContainerProps) => {
  return (
    <div className={`documents-table-container ${className}`}>{children}</div>
  );
};

export default DocumentsTableContainer;
