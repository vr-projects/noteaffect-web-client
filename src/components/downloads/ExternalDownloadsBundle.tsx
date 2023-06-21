import React from 'react';
import DownloadsGrid from './DownloadsGrid';
import DownloadPackages from '../../enums/DownloadPackages';
import Localizer from '../../utilities/Localizer';

const ExternalDownloadsBundle = () => {
  return (
    <div className="external-downloads external-downloads-bundle">
      <DownloadsGrid
        download={DownloadPackages.Bundle}
        description={Localizer.get(
          'Click the download button below to get the Broadcaster and Presentation Viewer for your Operating System'
        )}
      />
    </div>
  );
};

export default ExternalDownloadsBundle;
