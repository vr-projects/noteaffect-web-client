import {
  GENERAL_COMPONENT,
  COURSE_DETAIL_COMPONENT,
  COURSE_COMPONENT,
  INSTRUCTOR_LECTURE_REVIEWER_COMPONENT,
  LECTURE_REVIEWER_COMPONENT,
  LECTURE_ANALYTICS,
  CUSTOM_SECURITY_APP_ERRORS,
  SECURITY_OVERLAY,
  ANALYTICS_TOGGLE,
  COURSE_SECURITY_EVENTS,
} from './versionConstants';

const sharedVersionLanguage = {
  en: {
    // App-wide strings
    [GENERAL_COMPONENT.QUESTIONS]: 'Questions',
    [GENERAL_COMPONENT.DEPARTMENT]: 'Department',
    [GENERAL_COMPONENT.DEPARTMENTS]: 'Departments',
    [GENERAL_COMPONENT.POLL_SEGMENT]: 'Poll for Segment',
    [GENERAL_COMPONENT.SEGMENTS]: 'Segments',
    [GENERAL_COMPONENT.SEGMENT]: 'Segment',
    [GENERAL_COMPONENT.OBSERVER]: 'Observer',
    [GENERAL_COMPONENT.VIEWER]: 'Viewer',
    [GENERAL_COMPONENT.LOADING_SEGMENT_POLL]:
      'Getting segment polling information...',
    [GENERAL_COMPONENT.NO_POLL_QUESTION_SEGMENT]:
      "There wasn't a polling question on this segment.",
    [GENERAL_COMPONENT.POLL_VISUALIZATION_SEGMENT]:
      'Poll Visualization for Segment',
    [GENERAL_COMPONENT.ENGAGEMENT_PRESENTATION_DESCRIPTION]:
      "Engagement is the measurement of participants' note taking, annotating, and viewing of segments of this live presentation.",
    [GENERAL_COMPONENT.ENGAGEMENT_PRESENTATIONS_DESCRIPTION]:
      "Engagement is the measurement of participants' note taking, annotating, and viewing of segments of live presentations.",
    [GENERAL_COMPONENT.START]: 'Start',
    [GENERAL_COMPONENT.END]: 'End',
    [GENERAL_COMPONENT.DOCUMENTS]: 'Documents',
    [GENERAL_COMPONENT.DOCUMENT]: 'Document',

    // Component-specific strings
    [COURSE_DETAIL_COMPONENT.LECTURES_LOADING]:
      'Getting overview information...',
    [COURSE_COMPONENT.MENU_OVERVIEW]: 'Overview',

    [INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.PRESENTED_SEGMENTS]:
      'Presented Segments',

    [LECTURE_REVIEWER_COMPONENT.SEGMENT_REVIEW]: 'Segment Review',

    [LECTURE_ANALYTICS.UNIQUE_VIEWS]: 'Unique views',
    [LECTURE_ANALYTICS.NOTES_TAKEN]: 'Notes taken',
    [LECTURE_ANALYTICS.AVERAGE_WORDS]: 'Average words per note',
    [LECTURE_ANALYTICS.ANNOTATIONS]: 'Annotations made',

    [LECTURE_REVIEWER_COMPONENT.EXPORT]: 'Export Notes',
    [LECTURE_REVIEWER_COMPONENT.EXPORT_MINE]: 'Export My Notes',

    [CUSTOM_SECURITY_APP_ERRORS.PING_ERROR_LOST_CONNECTION]:
      'You have lost connection with the Presentation Viewer',
    [CUSTOM_SECURITY_APP_ERRORS.INITIALIZATION_ERROR]:
      'There was an error initializing the Presentation Viewer',

    [SECURITY_OVERLAY.PRESENTATION_VIEWER]: 'Presentation Viewer',
    [SECURITY_OVERLAY.DOWNLOAD_INSTRUCTIONS]:
      'If you do not have the Presentation Viewer application installed, click the download button below.',
    [SECURITY_OVERLAY.HELP_MESSAGE_1]:
      'Make sure that the Presentation Viewer is running on your system.',
    [SECURITY_OVERLAY.HELP_MESSAGE_2]:
      'Once you are sure the Presentation Viewer is running, click the Reload button to retry connecting to the Presentation Viewer.',

    [ANALYTICS_TOGGLE.LABEL]:
      'Include Analytics from Individuals with whom the presentation was Shared:',
    [ANALYTICS_TOGGLE.INCLUDE]: 'Include',
    [ANALYTICS_TOGGLE.EXCLUDE]: 'Exclude',

    [COURSE_SECURITY_EVENTS.ERROR]:
      'There was an error getting the security report',
  },
};

export default sharedVersionLanguage;
