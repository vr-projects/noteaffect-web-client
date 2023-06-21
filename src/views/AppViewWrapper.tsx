import * as React from 'react';
import { createStore, combineReducers, applyMiddleware, Store } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { runtime, SrUiComponent, AppOverlay, Animated } from 'react-strontium';
import * as Reducers from '../store/Reducers';
import * as AppActions from '../store/app/AppActions';
import ServiceReduxConnectionServices from '../services/ServiceReduxConnectionServices';
import AppHeaderContainer from '../components/containers/AppHeaderContainer';
import AppFooterContainer from '../components/containers/AppFooterContainer';

const store = createStore(
  combineReducers(Reducers),
  process.env.NODE_ENV !== 'production' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunk)
) as Store<any>;

export interface IAppViewWrapperProps {
  query?: string;
  viewPlugins?: React.ReactNode | React.ReactNode[];
}

export default abstract class AppViewWrapper<
  TProps extends IAppViewWrapperProps,
  TState
> extends SrUiComponent<TProps & IAppViewWrapperProps, TState> {
  abstract getView(): React.ReactNode;
  abstract getMenu(): string;

  onComponentMounted() {
    let svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    svc.setStore(store);
    store.dispatch(AppActions.changeMenu(this.getMenu()));
  }

  performRender() {
    const currentRoute = this.getMenu();
    const { query } = this.props;

    return (
      <div className="app-view-wrapper">
        <Provider store={store}>
          <>
            <AppHeaderContainer route={currentRoute} query={query} />
            <div className="app-view-wrapper-container">
              <Animated in>
                <div className="app-view-wrapper-body container-fluid">
                  {this.getView()}
                </div>
              </Animated>
              <AppFooterContainer />
            </div>
          </>
        </Provider>
        {this.props.viewPlugins}
        <AppOverlay />
      </div>
    );
  }
}
