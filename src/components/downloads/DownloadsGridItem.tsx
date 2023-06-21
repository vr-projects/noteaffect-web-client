import React from 'react';
import { FaApple, FaWindows } from 'react-icons/fa';
import { BsDownload } from 'react-icons/bs';
import Localizer from '../../utilities/Localizer';
import DownloadsOperatingSystems from '../../enums/DownloadsOperatingSystems';
import DownloadPackages from '../../enums/DownloadPackages';
import Link from '../controls/Link';

interface IDownloadsGridItemProps {
  os: DownloadsOperatingSystems;
  download: DownloadPackages;
  isActiveOs: boolean;
  className?: string;
}

const DownloadsGridItem = ({
  os,
  isActiveOs,
  download,
  className = '',
}: IDownloadsGridItemProps) => {
  const Icon =
    os === DownloadsOperatingSystems.Mac ? <FaApple /> : <FaWindows />;

  const getDownloadUrl = () => {
    switch (true) {
      // Mac
      case os === DownloadsOperatingSystems.Mac &&
        download === DownloadPackages.Bundle:
        return process.env.BUNDLE_DOWNLOAD_URL_MAC;
      case os === DownloadsOperatingSystems.Mac &&
        download === DownloadPackages.PresentationViewer:
        return process.env.SECURITY_APP_DOWNLOAD_URL_MAC;
      // Windows
      case os === DownloadsOperatingSystems.Windows &&
        download === DownloadPackages.Bundle:
        return process.env.BUNDLE_DOWNLOAD_URL_WINDOWS;
      case os === DownloadsOperatingSystems.Windows &&
        download === DownloadPackages.PresentationViewer:
        return process.env.SECURITY_APP_DOWNLOAD_URL_WINDOWS;
      default:
        return '';
    }
  };

  const getButtonStyle = () => {
    switch (true) {
      case isActiveOs && os === DownloadsOperatingSystems.Mac:
        return 'success';
      case isActiveOs && os === DownloadsOperatingSystems.Windows:
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className={`downloads-grid-item ${className}`}>
      <span className={`downloads-os-icon ${isActiveOs ? 'active-os' : ''}`}>
        {Icon}
      </span>
      <Link
        className={`btn btn-${getButtonStyle()}`}
        href={getDownloadUrl()}
        target="_blank"
      >
        <BsDownload />
        <span className="ml-1">
          {Localizer.get('Download for')}&nbsp;{os}
        </span>
      </Link>
    </div>
  );
};

export default DownloadsGridItem;
