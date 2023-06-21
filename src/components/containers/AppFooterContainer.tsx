import * as React from 'react';
import { connect } from 'react-redux';
import { SrUiComponent } from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IAppEnvironment from '../../interfaces/IAppEnvironment';
import AppFooter from '../nav/AppFooter';

interface IAppFooterProps {}

interface IConnectedAppFooterProps {
  menu?: string;
  appEnvironment?: IImmutableObject<IAppEnvironment>;
  logoUrl?: string | null;
  isCorpVersion?: boolean;
  storeLoading?: boolean;
}

interface IAppFooterContainerState {}

class AppFooterContainer extends SrUiComponent<
  IAppFooterProps & IConnectedAppFooterProps,
  IAppFooterContainerState
> {
  performRender() {
    return (
      <AppFooter
        isCorpVersion={this.props.isCorpVersion}
        logoUrl={this.props.logoUrl}
        storeLoading={this.props.storeLoading}
      />
    );
  }
}

export default connect<IConnectedAppFooterProps, {}, IAppFooterProps>(
  AppMappers.AppMapper
)(AppFooterContainer);
