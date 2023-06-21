import * as React from 'react';
import { SrUiComponent } from 'react-strontium';

interface IBreadcrumbLinkProps {
  linkEnabled?: boolean;
  onClick?: () => void;
}

interface IBreadcrumbLinkState {}

export default class BreadcrumbLink extends SrUiComponent<
  IBreadcrumbLinkProps,
  IBreadcrumbLinkState
> {
  // TODO tech debt determine if needed with above refactor
  clicked() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  performRender() {
    if (!this.props.linkEnabled) {
      return this.props.children;
    }
    return (
      <>
        <a
          className="na-breadcrumb breadcrumb-link"
          onClick={() => this.clicked()}
        >
          {this.props.children}
        </a>
      </>
    );
  }
}
