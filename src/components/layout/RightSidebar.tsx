import React from 'react';
import { Button } from 'react-bootstrap';
import { FaChevronRight } from 'react-icons/fa';

interface IRightSidebarProps {
  smallScreenMode: boolean;
  isCollapsed: boolean;
  title: string;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

class RightSidebar extends React.PureComponent<IRightSidebarProps> {
  render() {
    const {
      smallScreenMode,
      isCollapsed,
      title,
      onClose,
      className = '',
      children,
    } = this.props;

    return (
      <aside
        className={`right-sidebar ${
          !isCollapsed ? 'rsb-visible' : 'rsb-collapsed'
        } ${smallScreenMode ? 'small-screen' : ''} ${className}`}
      >
        <div
          className={`right-sidebar-inner ${
            smallScreenMode ? 'small-screen' : ''
          }`}
        >
          <header className="sidebar-header">
            <Button className="sidebar-close-btn" onClick={() => onClose()}>
              <FaChevronRight />
            </Button>
            <h3 className="sidebar-title-container">
              <span className="sidebar-title">{title}</span>
            </h3>
          </header>
          <section className="sidebar-content">{children}</section>
        </div>
      </aside>
    );
  }
}

export default RightSidebar;
