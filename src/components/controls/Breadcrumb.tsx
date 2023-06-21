import * as React from 'react';
import { SrUiComponent } from 'react-strontium';

interface IBreadcrumbProps {}

interface IBreadcrumbState {}

export default class Breadcrumb extends SrUiComponent<
  IBreadcrumbProps,
  IBreadcrumbState
> {
  getBreadcrumbs() {
    const results = [];
    const children = React.Children.toArray(this.props.children);

    React.Children.forEach(this.props.children, (child, index) => {
      results.push(child);
      let nextIsNull = children[index + 1] == null;
      if (
        !nextIsNull &&
        React.Children.count(this.props.children) - 1 !== index
      ) {
        results.push(
          <span
            key={index + '-divider'}
            className="na-breadcrumb breadcrumb-divider"
          >
            {' '}
            /{' '}
          </span>
        );
      }
    });

    return results;
  }

  performRender() {
    const hideBreadcrumb =
      !this.props.children || React.Children.count(this.props.children) === 1;

    return (
      <>
        {hideBreadcrumb ? (
          <>{this.props.children}</>
        ) : (
          <>{this.getBreadcrumbs()}</>
        )}
      </>
    );
  }
}
