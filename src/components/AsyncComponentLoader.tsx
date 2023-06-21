import * as React from 'react';
import Loadable from 'react-loadable';

type LoaderType<Props> = Promise<
  React.ComponentType<Props> | { default: React.ComponentType<Props> }
>;

interface IAsyncComponentProps<TProps> {
  loader: () => LoaderType<any>;
}

interface IAsyncComponentState<TProps> {
  componentClass: React.ComponentClass<TProps>;
}

export default class AsyncComponentLoader<TProps> extends React.Component<
  IAsyncComponentProps<TProps> & TProps,
  IAsyncComponentState<TProps>
> {
  constructor(props: IAsyncComponentProps<TProps> & TProps, context: any) {
    super(props, context);
    this.state = {
      componentClass: undefined,
    };
  }

  render(): React.ReactNode {
    return (
      <>
        {this.loadableComponentClass()}
        {this.loadedComponent()}
      </>
    );
  }

  // TODO  Consider removing, just importing.. causes several errors in console
  loadableComponentClass() {
    const LoadableView = Loadable({
      loader: async () => {
        const imported = await this.props.loader();
        if (!this.state.componentClass) {
          this.setState({ componentClass: (imported as any).default });
        }
        return imported;
      },
      loading: () => null,
      render: (loaded, props) => {
        return null;
      },
    });

    LoadableView.preload();
    return <LoadableView {...this.props} />;
  }

  loadedComponent() {
    if (this.state.componentClass) {
      const Component = this.state.componentClass as any;
      const { loader, ...props } = this.props as any;
      return <Component {...props} />;
    }
  }
}
