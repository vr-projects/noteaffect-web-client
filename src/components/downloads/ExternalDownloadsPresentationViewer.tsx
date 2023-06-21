import React from 'react';
import DownloadsGrid from './DownloadsGrid';
import DownloadPackages from '../../enums/DownloadPackages';
import Localizer from '../../utilities/Localizer';

const ExternalDownloadsPresentationViewer = () => {
  return (
    <div className="external-downloads external-downloads-presentation-viewer">
      <DownloadsGrid
        download={DownloadPackages.PresentationViewer}
        description={Localizer.get(
          'Click the download button below to get the Presentation Viewer for your Operating System'
        )}
      />
    </div>
  );
};

export default ExternalDownloadsPresentationViewer;
