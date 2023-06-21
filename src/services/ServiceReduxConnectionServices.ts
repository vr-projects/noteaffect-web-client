import {
  SrServiceResponse,
  SrAppMessage,
  LoadStates,
  IAppService,
  CommonMessages,
  Log,
  runtime,
} from 'react-strontium';
import { Store, Dispatch } from 'redux';
import { DispatchProp } from 'react-redux';
import * as AppReducer from '../store/app/AppReducer';
import * as AppActions from '../store/app/AppActions';
import * as SecurityReducer from '../store/security/SecurityReducer';
import AppBroadcastEvents from '../broadcastEvents/AppBroadcastEvents';
import * as PresentationActions from '../store/presentation/PresentationActions';
import * as DrawableSurfaceActions from '../store/drawable_surface/DrawableSurfaceActions';
import PresentationState from '../PresentationState';
import IQuestion from '../models/IQuestion';
import RealtimeBroadcastEvents from '../broadcastEvents/RealtimeBroadcastEvents';

export default class ServiceReduxConnectionServices
  implements DispatchProp<any>, IAppService {
  private _store: Store<any>;

  public dispatch: Dispatch<any>;

  async setStore(store: Store<any>) {
    if (!this._store) {
      // runtime.messaging.broadcast(AppMessages.NoteAffectAppReady, false);
      Log.d(this, 'Setting and subscribing to store');
      this._store = store;

      this._store.dispatch(
        AppActions.setUserInformation(window.userInformation)
      );

      this._store.dispatch(
        AppActions.setUserPermissions(window.userPermissions)
      );

      this._store.dispatch(AppActions.setAppEnvironment(window.appEnvironment));

      if (window.appEnvironment.client.logoUrl !== null) {
        this._store.dispatch(
          AppActions.setAppLogoUrl(window.appEnvironment.client.logoUrl)
        );
      }

      this._store.dispatch(AppActions.setStoreLoading(LoadStates.Succeeded));

      store.subscribe(() => this.onStoreChange());
      this.dispatch = this._store.dispatch;
      runtime.messaging.broadcast(AppBroadcastEvents.NoteAffectAppReady, true);

      // store is ready, clean up the window object
      delete window.userPermissions;
      delete window.userInformation;
      delete window.appEnvironment;
      delete window.exportData;
    }
  }

  public getStoreSessionId() {
    return SecurityReducer.getSessionId(this._store.getState());
  }

  public getUserInformation() {
    return AppReducer.getUserInformation(this._store.getState());
  }

  public getUserPermissions() {
    if (!this._store) {
      return window.userPermissions;
    }
    return AppReducer.getUserPermissions(this._store.getState()).toJS();
  }

  public getAppEnvironment() {
    return AppReducer.getAppEnvironment(this._store.getState());
  }
  public getAppEnvironmentLexicon() {
    if (!this._store) {
      return window.appEnvironment.lexicon;
    }
    return AppReducer.getAppEnvironment(this._store.getState()).lexicon;
  }

  public getAppLogoUrl() {
    if (!this._store) {
      return window.appEnvironment.client.logoUrl;
    }
    return AppReducer.getAppLogoUrl(this._store.getState());
  }

  onStoreChange() {
    Log.t(this, 'Application state changed', this.stateForLogging());
  }

  stateForLogging() {
    let state = this._store.getState();
    let logState: any = {};
    for (var key in state) {
      logState[key] = state[key];
    }
    if (logState.presentation.uiContainer) {
      logState.presentation = state.presentation.set(
        'uiContainer',
        '<present>'
      );
    }
    return logState;
  }

  initialize(): void {}

  handles(): string[] {
    return [
      CommonMessages.RemoteOriginatedMessage,
      'NoteAffect.UserInfoRefreshed', // TODO tech debt confirm if ever called
    ];
  }

  receiveMessage(msg: SrAppMessage) {
    Log.t(this, 'Direct message', msg);

    if (msg.action === CommonMessages.RemoteOriginatedMessage) {
      let resp = msg.data as SrServiceResponse;

      switch (resp.action) {
        case RealtimeBroadcastEvents.NewPresentationStarting:
          this.handleNewPresentationStarting(resp);
          return;
        case RealtimeBroadcastEvents.PollResponseSaved:
          runtime.messaging.broadcast(
            AppBroadcastEvents.LivePollingUpdated,
            true,
            resp.data
          );
          return;
        case RealtimeBroadcastEvents.PresentationEnded:
          this.handlePresentationEnded(resp);
          return;
        case RealtimeBroadcastEvents.QuestionAsked:
          this.handleAskedQuestioned(resp);
          return;
        case RealtimeBroadcastEvents.SlidePresented:
          this.handlePresentedSlide(resp);
          return;
        case RealtimeBroadcastEvents.UserQuestionsUpdated:
          this.handleUserQuestionsUpdated(resp);
          return;
        default:
          return;
      }
    }
  }

  handlePresentedSlide(resp: SrServiceResponse) {
    this._store.dispatch(
      PresentationActions.updatePresentation({
        state: PresentationState.Live,
        courseId: resp.data.courseId,
        lectureId: resp.data.lectureId,
        slide: resp.data.slideNumber,
        totalSlides: resp.data.slides,
        id: resp.data.slideId,
        sequence: resp.data.sequence,
        imageUrl: resp.data.imageUrl,
      })
    );

    runtime.messaging.broadcast(
      AppBroadcastEvents.LivePresentationUpdated,
      true,
      {
        seriesId: resp.data.courseId,
        lectureId: resp.data.lectureId,
        slideNumber: resp.data.slideNumber,
      }
    );
  }

  handleAskedQuestioned(resp: SrServiceResponse) {
    const question = resp.data as IQuestion;
    this._store.dispatch(PresentationActions.receivedQuestion(question));
    runtime.messaging.broadcast(
      AppBroadcastEvents.LivePresentationUpdated,
      true,
      {
        seriesId: resp.data.seriesId,
        lectureId: resp.data.lectureId,
        slideNumber: resp.data.slide,
      }
    );
  }

  handleNewPresentationStarting(resp: SrServiceResponse) {
    const seriesId = resp.data.seriesId;
    this._store.dispatch(PresentationActions.resetLivePresentation(seriesId));
    this._store.dispatch(DrawableSurfaceActions.updateDrawingEnabled(false));
    runtime.messaging.broadcast(
      AppBroadcastEvents.PresentationStarting,
      true,
      resp.data
    );
  }

  handlePresentationEnded(resp: SrServiceResponse) {
    runtime.messaging.broadcast(
      AppBroadcastEvents.PresentationEnded,
      true,
      resp.data
    );
  }

  handleUserQuestionsUpdated(resp: SrServiceResponse) {
    const seriesId = resp.data.seriesId;
    const lectureId = resp.data.lectureId;
    runtime.messaging.broadcast(AppBroadcastEvents.UserQuestionsUpdated, true, {
      seriesId,
      lectureId,
    });
  }
}
