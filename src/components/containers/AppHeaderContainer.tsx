import * as React from 'react';
import isNull from 'lodash/isNull';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { SrUiComponent, LoadStates } from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import IAppEnvironment from '../../interfaces/IAppEnvironment';
import AppHeader from '../nav/AppHeader';

interface IConnectedAppHeaderContainerProps {
  menu?: string;
  query?: string;
  userInformation?: IImmutableObject<IUserInformation>;
  userPermissions?: IImmutableObject<IUserPermissions>;
  appEnvironment?: IImmutableObject<IAppEnvironment>;
  logoUrl?: string;
  isCorpVersion?: boolean;
  isPresentationFullscreen?: boolean;
  storeLoading?: LoadStates;
}

interface IAppHeaderContainerProps {
  route: string;
  query: string;
}

interface IAppHeaderContainerState {}

class AppHeaderContainer extends SrUiComponent<
  IAppHeaderContainerProps & IConnectedAppHeaderContainerProps,
  IAppHeaderContainerState
> {
  performRender() {
    const {
      menu,
      route,
      query,
      userInformation,
      userPermissions,
      isCorpVersion,
      logoUrl,
      isPresentationFullscreen,
      storeLoading,
    } = this.props;

    const userInfo = !isNull(userInformation)
      ? userInformation.toJS()
      : undefined;
    const userPerms = !isNull(userPermissions)
      ? userPermissions.toJS()
      : undefined;

    return (
      <CSSTransition
        in={!isPresentationFullscreen}
        classNames={'rtg-slide-up'}
        timeout={0}
      >
        <AppHeader
          menu={menu}
          route={route}
          query={query}
          userInformation={userInfo}
          userPermissions={userPerms}
          isCorpVersion={isCorpVersion}
          logoUrl={logoUrl}
          storeLoading={storeLoading}
        />
      </CSSTransition>
    );
  }
}

export default connect<
  IConnectedAppHeaderContainerProps,
  {},
  IAppHeaderContainerProps
>(AppMappers.AppMapper)(AppHeaderContainer);
