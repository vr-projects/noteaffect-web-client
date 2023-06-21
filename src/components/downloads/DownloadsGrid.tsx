import React from 'react';
import DownloadsGridItem from './DownloadsGridItem';
import Localizer from '../../utilities/Localizer';
import DownloadsOperatingSystems from '../../enums/DownloadsOperatingSystems';
import DownloadPackages from '../../enums/DownloadPackages';
import * as UAParserUtil from '../../utilities/UAParserUtil';

interface IDownloadsGrid {
  download: DownloadPackages;
  description: string;
}

const DownloadsGrid = ({ download, description }: IDownloadsGrid) => {
  const isMac = UAParserUtil.getIsMacOs();
  const isWindows = UAParserUtil.getIsWindowsOs();

  return (
    <div className="downloads-grid">
      <div className="downloads-grid-title">
        <h1>
          {Localizer.get('Download')} {download}
        </h1>
        <p>{description}</p>
      </div>
      <DownloadsGridItem
        className={`downloads-grid-item mac-download`}
        os={DownloadsOperatingSystems.Mac}
        isActiveOs={isMac}
        download={download}
      />
      <DownloadsGridItem
        className={`downloads-grid-item windows-download`}
        os={DownloadsOperatingSystems.Windows}
        isActiveOs={isWindows}
        download={download}
      />
    </div>
  );
};

export default DownloadsGrid;
