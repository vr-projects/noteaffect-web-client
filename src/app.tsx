import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  ServicesConfigElement,
  ServiceConfigElement,
  StrontiumApp,
  LoggerConfigElement,
  ApiConfigElement,
  UiConfigElement,
  LogLevel,
  RouteConfigElement,
  IApiConnection,
} from 'react-strontium';
import { SignalRHubConnection } from 'react-strontium-signalr';
// Components
import DashboardView from './views/DashboardView';
import CourseView from './views/CourseView';
import ServiceReduxConnectionServices from './services/ServiceReduxConnectionServices';
import QuestionBuilderView from './views/QuestionBuilderView';
import AdminView from './views/AdminView';
import DepartmentsView from './views/DepartmentsView';
import CorpAccountView from './views/CorpAccountView';
import InstructorCoursesView from './views/InstructorCoursesView';
import InstructorCourseView from './views/InstructorCourseView';
import AdminUsersView from './views/AdminUsersView';
import RsvpDistroRegistrationView from './views/RsvpDistroRegistrationView';
import MyDocumentsView from './views/MyDocumentsView';
import SignatureRequestsView from './views/SignatureRequestsView';

import TimeService from './services/TimeService';
import DataStorageService from './services/DataStorageService';
import WindowVisibilityService from './services/WindowVisibilityService';
import ChartConfigService from './services/ChartConfigService';
import CustomApiConnection from './api/CustomApiConnection';
import VersionService from './version/versionService';
import RealtimeBroadcastEvents from './broadcastEvents/RealtimeBroadcastEvents';
import SystemRoleService from './services/SystemRoleService';
import SystemRoles from './enums/SystemRoles';

export default class NoteAffectApp {
  connections(): { name: string; connection: IApiConnection }[] {
    return [
      {
        name: 'realtime',
        connection: new SignalRHubConnection({
          hubUrl: '/clientHub',
          reconnectOnClose: true,
          handled: [
            RealtimeBroadcastEvents.NewPresentationStarting,
            RealtimeBroadcastEvents.PollResponseSaved,
            RealtimeBroadcastEvents.PresentationEnded,
            RealtimeBroadcastEvents.QuestionAsked,
            RealtimeBroadcastEvents.SlidePresented,
            RealtimeBroadcastEvents.UserQuestionsUpdated,
          ],
        }),
      },
      { name: 'default', connection: new CustomApiConnection('/api/') },
    ];
  }

  // TODO tech debt explore if plugins used
  viewPlugins(): React.ReactNode | React.ReactNode[] {
    return null;
  }

  // TODO tech debt explore if calling this necessary to instantiate and use services
  services(): React.ReactNode | React.ReactNode[] {
    return null;
  }

  logLevel(): LogLevel {
    if (process.env.NODE_ENV !== 'production') {
      return LogLevel.None;
    }
    return LogLevel.Warn;
  }

  run() {
    let app = (
      <StrontiumApp>
        <LoggerConfigElement loggingLevel={this.logLevel()} />
        {this.connections().map((config) => {
          return <ApiConfigElement key={config.name} {...config} />;
        })}
        <ServicesConfigElement>
          {/* //** Service for user data, permissions, main app actions presentations, questions, notes */}
          <ServiceConfigElement
            id="serviceReduxConnection"
            service={new ServiceReduxConnectionServices()}
          />
          {/* //** Service for client/server time, time in app window, time when app started */}
          <ServiceConfigElement id="timeService" service={new TimeService()} />
          <ServiceConfigElement
            id="dataStorageService"
            service={new DataStorageService()}
          />
          <ServiceConfigElement
            id="windowVisibilityService"
            service={new WindowVisibilityService()}
          />
          <ServiceConfigElement
            id="chartConfigService"
            service={new ChartConfigService()}
          />
          {/* //** Service for corp vs. edu language */}
          <ServiceConfigElement
            id="versionService"
            service={new VersionService()}
          />
          {this.services()}
        </ServicesConfigElement>
        {/* These props are passed to a new instance of StrontiumUiConfig */}
        <UiConfigElement
          urlNavigationEnabled // ** setting to false allows nav but doesn't populate URL
          navigateOnQueryChanges // ** setting to false disables MenuView since uses query string to navigate tabs
          appTitle="NoteAffect"
          basePath="app" // ** populates after initial redirect (which has `app`)
          defaultLocation={
            // ** initial route
            SystemRoleService.hasSomeRoles([
              SystemRoles.PRESENTER,
              SystemRoles.SALES_PRESENTER,
              SystemRoles.DEPARTMENT_ADMIN,
              SystemRoles.CLIENT_ADMIN,
              SystemRoles.ADMIN,
            ])
              ? 'instructor/courses'
              : 'dashboard'
          }
          rootElement="app-content"
        >
          <RouteConfigElement
            route="dashboard"
            view={(d) => <DashboardView viewPlugins={this.viewPlugins()} />}
          />

          <RouteConfigElement
            route="course/:[int]id"
            view={(d) => (
              <CourseView
                courseId={d.parsed.id}
                viewPlugins={this.viewPlugins()}
                menu={d.query.menu}
                query={d.query}
                engagementId={d.query.engagementId}
                lectureId={d.query.lecture}
              />
            )}
          />

          <RouteConfigElement
            route="instructor/courses"
            view={(d) => (
              <InstructorCoursesView
                params={d.query}
                viewPlugins={this.viewPlugins()}
              />
            )}
          />

          <RouteConfigElement
            route="instructor/course/:[int]id"
            view={(d) => (
              <InstructorCourseView
                courseId={d.parsed.id}
                viewPlugins={this.viewPlugins()}
                menu={d.query.menu}
                user={d.query.user}
                query={d.query}
                lectureId={d.query.lecture}
                documentId={d.query.document}
              />
            )}
          />

          <RouteConfigElement
            route="instructor/questions"
            view={(d) => (
              <QuestionBuilderView
                viewPlugins={this.viewPlugins()}
                menu={d.query.menu}
              />
            )}
          />

          <RouteConfigElement
            route="admin/site"
            view={(d) => (
              <AdminView viewPlugins={this.viewPlugins()} menu={d.query.menu} />
            )}
          />

          <RouteConfigElement
            route="admin/users"
            view={(d) => (
              <AdminUsersView
                viewPlugins={this.viewPlugins()}
                menu={d.query.menu}
              />
            )}
          />

          <RouteConfigElement
            route="admin/departments"
            view={(d) => (
              <DepartmentsView
                viewPlugins={this.viewPlugins()}
                menu={d.query}
              />
            )}
          />

          <RouteConfigElement
            route="admin/account"
            view={(d) => (
              <CorpAccountView
                viewPlugins={this.viewPlugins()}
                menu={d.query}
              />
            )}
          />

          <RouteConfigElement
            route="rsvp/distro-registration"
            view={(d) => (
              <RsvpDistroRegistrationView
                viewPlugins={this.viewPlugins()}
                query={d.query}
              />
            )}
          />

          <RouteConfigElement
            route="documents/my-documents"
            view={(d) => (
              <MyDocumentsView
                viewPlugins={this.viewPlugins()}
                query={d.query}
              />
            )}
          />

          <RouteConfigElement
            route="documents/signature-requests"
            view={(d) => (
              <SignatureRequestsView
                viewPlugins={this.viewPlugins()}
                query={d.query}
              />
            )}
          />
        </UiConfigElement>
      </StrontiumApp>
    );
    ReactDOM.render(app, document.getElementById('app-content'));
  }
}

new NoteAffectApp().run();
