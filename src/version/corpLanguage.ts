import {
  GENERAL_COMPONENT,
  GENERAL_TABLES,
  ADD_COURSE_POPOVER_COMPONENT,
  ADD_EMAIL_POPOVER_COMPONENT,
  ARBITRARY_GROUP_LAYOUT_COMPONENT,
  ARBITRARY_GROUP_DETAIL_COMPONENT,
  ARBITRARY_GROUP_COURSES_COMPONENT,
  ASK_QUESTION_POPOVER_COMPONENT,
  COURSES_COMPONENT,
  COURSE_ANALYTICS_COMPONENT,
  COURSE_ANALYTICS_TRENDS_COMPONENT,
  COURSE_DETAIL_COMPONENT,
  COURSE_ENGAGEMENT_COMPONENT,
  COURSE_ENGAGEMENT_TRENDS_COMPONENT,
  COURSE_PARTICIPANTS_COMPONENT,
  DEPARTMENTS_COMPONENT,
  DEPARTMENT_COURSE_PARTICIPANT_COMPONENT,
  DEPARTMENT_EDIT_DEPARTMENT_COMPONENT,
  EDIT_PARTICIPANTS_COMPONENT,
  EDIT_PERIOD_DIALOG_COMPONENT,
  GROUP_ANALYTICS_COMPONENT,
  GROUP_ENGAGEMENT_COMPONENT,
  GROUP_ENGAGEMENT_TRENDS_COMPONENT,
  GROUPS_VIEW_COMPONENT,
  INSTRUCTOR_COURSES_COMPONENT,
  INSTRUCTOR_COURSE_LECTURES_COMPONENT,
  INSTRUCTOR_LECTURE_REVIEWER_COMPONENT,
  INSTRUCTOR_PRESENTATION_PLAYBACK_CONTROLS_COMPONENT,
  LECTURE_DETAIL_COMPONENT,
  LECTURE_ENGAGEMENT_COMPONENT,
  LECTURE_RENAME_POPUP_COMPONENT,
  LECTURE_SEARCH_AND_SORT_COMPONENT,
  LECTURE_STOP_BUTTON_COMPONENT,
  LIVE_PRESENTATION_QUESTIONS_COMPONENT,
  NAV_ADMIN_MENU_COMPONENT,
  NAV_INSTRUCTOR_MENU_COMPONENT,
  PARTICIPANT_OVERVIEW_COMPONENT,
  POLL_REVIEWER_COMPONENT,
  SERIES_DOCUMENTS,
} from './versionConstants';

const corpVersionLanguage = {
  en: {
    // NON-COMPONENT SPECIFIC
    [GENERAL_COMPONENT.INSTRUCTOR_PRESENTER]: 'Presenter',
    [GENERAL_COMPONENT.INSTRUCTORS_PRESENTERS]: 'Presenters',
    [GENERAL_COMPONENT.ADD_INSTRUCTOR_PRESENTER]: 'Add Presenter',
    [GENERAL_COMPONENT.STUDENT_PARTICIPANT]: 'Participant',
    [GENERAL_COMPONENT.STUDENTS_PARTICIPANTS]: 'Participants',
    [GENERAL_COMPONENT.REGISTERED_PARTICIPANTS]: 'Registered Participants',
    [GENERAL_COMPONENT.UNREGISTERED_PARTICIPANTS]: 'Unregistered Participants',
    [GENERAL_COMPONENT.DISTROLIST_INVITATIONS]: 'Distribution List Invitations',
    [GENERAL_COMPONENT.ADD_STUDENT_PARTICIPANT]: 'Add Participant',
    [GENERAL_COMPONENT.STUDENT_COURSES_PARTICIPANT_MEETINGS]:
      'Participant Meetings',
    [GENERAL_COMPONENT.COURSE_MEETING]: 'Meeting',
    [GENERAL_COMPONENT.COURSES_MEETINGS]: 'Meetings',
    [GENERAL_COMPONENT.NO_COURSES_MEETINGS]: 'No Meetings Found...',
    [GENERAL_COMPONENT.ALL_COURSES_MEETINGS]: 'All Meetings',
    [GENERAL_COMPONENT.TOP_COURSES_MEETINGS]: 'Top Meetings',
    [GENERAL_COMPONENT.COURSE_MEETING_GROUPS]: 'Meeting Groups',
    [GENERAL_COMPONENT.COURSE_MEETING_NAME]: 'Meeting Name',
    [GENERAL_COMPONENT.LECTURE_PRESENTATION]: 'Presentation',
    [GENERAL_COMPONENT.LECTURES_PRESENTATIONS]: 'Presentations',
    [GENERAL_COMPONENT.UNNAMED_LECTURE_PRESENTATION]: 'Unnamed Presentation',
    [GENERAL_COMPONENT.LOADING_LECTURES_PRESENTATIONS]:
      'Getting presentations...',
    [GENERAL_COMPONENT.ERROR_LECTURES_PRESENTATIONS]:
      'There was a problem getting your presentations.  Please try refreshing the page.',
    [GENERAL_COMPONENT.NONE_LECTURES_PRESENTATIONS_COURSE_MEETING]:
      "There aren't any presentations for this meeting, yet.",
    [GENERAL_COMPONENT.NO_PRESENTATION_LECTURE_PRESENTATION]:
      'There is no presentation for this presentation.',
    [GENERAL_COMPONENT.STUDENT_PARTICIPANT_QUESTIONS]: 'Participant Questions',
    [GENERAL_COMPONENT.ERROR_STUDENT_PARTICIPANT_QUESTIONS]:
      'There was a problem getting participant questions.  Please try refreshing the page.',
    [GENERAL_COMPONENT.LOADING_STUDENT_PARTICIPANT_QUESTIONS]:
      'Getting participant questions...',
    [GENERAL_COMPONENT.NONE_STUDENT_PARTICIPANT_QUESTIONS]:
      "There aren't any questions for this meeting.",
    [GENERAL_COMPONENT.LOADING_COURSE_MEETING]:
      'Getting meeting information...',
    [GENERAL_COMPONENT.LOADING_COURSES_MEETINGS]: 'Getting meetings',
    [GENERAL_COMPONENT.ERROR_COURSE_MEETING]:
      'There was an error getting this meeting.',
    [GENERAL_COMPONENT.ERROR_COURSES_MEETINGS]:
      'There was an error getting meetings information',
    [GENERAL_COMPONENT.NO_PARTICIPATION]:
      'Meeting participation information will be available after presentations have occurred.',
    [GENERAL_COMPONENT.PARTICIPATION_PRESENTATION_DESCRIPTION]:
      'Participation is the measurement of participants in the meeting (at the time of presentation) who viewed at least one segment of this live presentation.',
    [GENERAL_COMPONENT.PARTICIPATION_PRESENTATIONS_DESCRIPTION]:
      'Participation is the measurement of participants in the meeting (at the time of presentation) who viewed at least one segment of live presentations.',
    [GENERAL_COMPONENT.NO_QUESTIONS_COURSE_MEETING]:
      "There aren't any questions for this meeting.",
    [GENERAL_COMPONENT.NO_QUESTIONS_LECTURE_PRESENTATION]:
      "There aren't any questions for this presentation.",
    [GENERAL_COMPONENT.POLL_PRESENTATION_DESCRIPTION]:
      'Polling rates are the measurement of how many of the participants answered all polls in this presentation.',
    [GENERAL_COMPONENT.POLL_PRESENTATIONS_DESCRIPTION]:
      'Polling rates are the measurement of how many of the participants answered polls asked during live presentations.',
    [GENERAL_COMPONENT.YOUR_COURSE_MEETING_PARTICIPATION]:
      'Your Meeting Participation',
    [GENERAL_COMPONENT.COURSE_MEETING_PARTICIPATION]: 'Meeting Participation',

    // Text in multiple tables
    [GENERAL_TABLES.COURSE_MEETING_PARTICIPATION]: 'Meeting Participation',
    [GENERAL_TABLES.LECTURE_PRESENTATION_PARTICIPATION]:
      'Presentation Participation',
    [GENERAL_TABLES.LECTURES_PRESENTATIONS_VIEWED]: 'Presentations viewed',
    [GENERAL_TABLES.NOT_YET_IN_COURSE_MEETING]: 'Not yet in meeting',

    // Component-specific
    [ADD_COURSE_POPOVER_COMPONENT.BUTTON_LABEL]: 'Add Meeting',
    [ADD_COURSE_POPOVER_COMPONENT.POPOVER_TITLE]: 'Add new meeting',
    [ADD_COURSE_POPOVER_COMPONENT.PLACEHOLDER]: 'Meeting name',
    [ADD_COURSE_POPOVER_COMPONENT.ERROR_NAME]:
      'Please enter a valid meeting name',
    [ADD_COURSE_POPOVER_COMPONENT.LOADING]: 'Adding meeting...',
    [ADD_COURSE_POPOVER_COMPONENT.ERROR_SAVING]:
      'There was a problem adding this meeting.  Try later.',

    [ADD_EMAIL_POPOVER_COMPONENT.DESCRIPTION_INSTRUCTOR_PRESENTER]:
      'Add presenter by email (unregistered users will be sent an invitation to join NoteAffect)',
    [ADD_EMAIL_POPOVER_COMPONENT.DESCRIPTION_STUDENT_PARTICIPANT]:
      'Add participant by email (unregistered users will be sent an invitation to join NoteAffect)',

    [ARBITRARY_GROUP_LAYOUT_COMPONENT.SEARCH_COURSES_MEETINGS]:
      'Search meetings',

    [ARBITRARY_GROUP_DETAIL_COMPONENT.COURSES_MEETINGS_TAB]: 'Meetings',

    [ARBITRARY_GROUP_COURSES_COMPONENT.ERROR]:
      'There are no meetings available in this group.',

    [ASK_QUESTION_POPOVER_COMPONENT.UNSEEN_QUESTION]:
      "Other participants won't see your name on the question.",
    [ASK_QUESTION_POPOVER_COMPONENT.QUESTION_COURSE_MEETING]:
      'Ask a question about this meeting',
    [ASK_QUESTION_POPOVER_COMPONENT.QUESTION_LECTURE_PRESENTATION]:
      'Ask a question about this presentation',
    [ASK_QUESTION_POPOVER_COMPONENT.QUESTION_SEGMENT]:
      'Ask a question about this segment',

    [COURSES_COMPONENT.TITLE]: 'Your Meetings',
    [COURSES_COMPONENT.CURRENT]: 'Current Meetings',
    [COURSES_COMPONENT.UPCOMING]: 'Upcoming Meetings',
    [COURSES_COMPONENT.PREVIOUS]: 'Previous Meetings',
    [COURSES_COMPONENT.UNREGISTERED]: "You aren't registered for any meetings.",

    [COURSE_ANALYTICS_COMPONENT.TITLE]: 'Meeting Analytics',
    [COURSE_ANALYTICS_COMPONENT.LOADING]: 'Getting meetings analytics...',
    [COURSE_ANALYTICS_COMPONENT.LECTURES_ERROR]:
      'There was an error getting your lectures.',
    [COURSE_ANALYTICS_COMPONENT.DOCUMENTS_ERROR]:
      'There was an error getting your documents',
    [COURSE_ANALYTICS_COMPONENT.ANALYTICS_ERROR]:
      'Your analytics have not yet completed processing or not enough data has been collected to provide you with meaningful data. Please check back later.',
    [COURSE_ANALYTICS_COMPONENT.NONE]:
      'There have been no presentations in this meeting.  Analysis of your presentations will be available after you have completed a presentation.',
    [COURSE_ANALYTICS_COMPONENT.NO_DOCUMENTS]:
      'There are no documents associated with this meeting',

    [COURSE_ANALYTICS_TRENDS_COMPONENT.TITLE]: 'Presentation Trends',
    [COURSE_ANALYTICS_TRENDS_COMPONENT.NONE]:
      'Meeting trends will be available after you have completed at least two presentations.',

    [COURSE_DETAIL_COMPONENT.TITLE]: 'Meeting Overview',
    [COURSE_DETAIL_COMPONENT.LECTURES_ERROR]:
      'There was a problem getting your meeting overview information.',
    [COURSE_DETAIL_COMPONENT.OVERVIEW_ERROR]:
      'There was a problem getting your meeting overview information. Check back soon.',
    [COURSE_DETAIL_COMPONENT.NO_OVERVIEW]:
      'There was a problem getting your meeting participation information.  Please try refreshing the page.',

    [COURSE_ENGAGEMENT_COMPONENT.TITLE]: 'Meeting Engagement',
    [COURSE_ENGAGEMENT_COMPONENT.ERROR]:
      'Your analytics have not yet completed processing or not enough data has been collected to provide you with meaningful data. Please check back later.',

    [COURSE_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS]:
      'No polls have been asked in this meeting',

    [COURSE_PARTICIPANTS_COMPONENT.TITLE]: 'Meeting Participants',
    [COURSE_PARTICIPANTS_COMPONENT.LOADING]:
      'Getting participant information...',
    [COURSE_PARTICIPANTS_COMPONENT.ERROR]:
      "There was an error retrieving participant information.  Viewing analytics won't be possible.",

    [DEPARTMENTS_COMPONENT.COURSES_MEETINGS_DEPTS]: 'Meetings & Depts.',

    [DEPARTMENT_COURSE_PARTICIPANT_COMPONENT.REMOVE]: 'Remove',
    [DEPARTMENT_COURSE_PARTICIPANT_COMPONENT.PROMOTE]: 'Make Presenter',

    [DEPARTMENT_EDIT_DEPARTMENT_COMPONENT.SUBTITLE]:
      'Select the desired department for this meeting:',

    [EDIT_PARTICIPANTS_COMPONENT.TITLE_ADD]: 'Add Meeting Participants',
    [EDIT_PARTICIPANTS_COMPONENT.TITLE_EDIT]: 'Edit Meeting Participants',
    [EDIT_PARTICIPANTS_COMPONENT.NO_PARTICIPANTS]:
      'There are currently no registered participants for this meeting.',
    [EDIT_PARTICIPANTS_COMPONENT.INVITED]:
      'The requested participants have been added or invited to this meeting.',

    [GROUP_ANALYTICS_COMPONENT.NO_PRESENTATIONS]:
      'There have been no presentations in this group. Analytics information for meetings will be available after one or more meetings have completed a presentation.',

    [EDIT_PERIOD_DIALOG_COMPONENT.SELECT]:
      'Select the desired department for this meeting:',

    [GROUP_ENGAGEMENT_COMPONENT.ERROR]:
      'There was a problem getting engagement information, or not enough data has been collected to provide you with meaningful data. Please check back after one or more meetings have completed a presentation.',
    [GROUP_ENGAGEMENT_COMPONENT.NO_PRESENTATIONS]:
      'There have been no presentations in this group. Engagement information for meetings will be available after one or more meetings have completed a presentation.',

    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_ENGAGEMENT]:
      'Top Meetings for Engagement',
    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_PARTICIPATION]:
      'Top Meetings for Participation',
    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS]:
      'No polls have been asked in any meeting in this group',
    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_POLLING]:
      'Top Meetings for Polling Answers',

    [GROUPS_VIEW_COMPONENT.DESCRIPTION]:
      'Use Meeting Groups to build powerful custom selections of meetings.  Each group has all engagement and analytics information aggregated for review and can be used to segment your meetings in any way you see fit, such as by day of week, or any grouping you desire.',

    [INSTRUCTOR_COURSES_COMPONENT.COURSE_MEETING_MANAGEMENT]:
      'Meeting Management',

    [INSTRUCTOR_COURSE_LECTURES_COMPONENT.START_NEW]: 'Start new presentation',
    [INSTRUCTOR_COURSE_LECTURES_COMPONENT.BROADCASTER]:
      'Waiting for your presentation to begin...',

    [INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.QUESTIONS_TITLE]:
      'Presentation Questions',
    [INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.NO_SEGMENTS]:
      'There are no segments for this presentation.',
    [INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.QUESTION_ERROR]:
      'There was a problem getting questions for this presentation.',

    [INSTRUCTOR_PRESENTATION_PLAYBACK_CONTROLS_COMPONENT.SHARED_AUDIO]:
      'Audio shared with participants',

    [LECTURE_DETAIL_COMPONENT.TITLE]: 'Choose a presentation',
    [LECTURE_DETAIL_COMPONENT.DESCRIPTION]:
      'Please choose a presentation from the menu.',

    [LECTURE_ENGAGEMENT_COMPONENT.NO_SEGMENTS]:
      'There were no segments presented during this presentation.',
    [LECTURE_ENGAGEMENT_COMPONENT.NO_POLLS]:
      'There were no polls asked during this presentation.',
    [LECTURE_ENGAGEMENT_COMPONENT.NO_PARTICIPATION]:
      'No participants participated in this presentation.',
    [LECTURE_ENGAGEMENT_COMPONENT.NON_PARTICIPATING]:
      'There were no non-participating participants.',
    [LECTURE_ENGAGEMENT_COMPONENT.NON_PARTICIPATING_TITLE]: 'Non-participating',
    [LECTURE_ENGAGEMENT_COMPONENT.NOT_IN_COURSE_MEETING]:
      'Participants not yet in meeting',
    [LECTURE_ENGAGEMENT_COMPONENT.NOT_YET_ACTIVE]:
      'There were no not-yet-active participants',
    [LECTURE_ENGAGEMENT_COMPONENT.PARTICIPANTS]: 'Participants',

    [LECTURE_RENAME_POPUP_COMPONENT.TITLE]: 'Rename Presentation',

    [LECTURE_SEARCH_AND_SORT_COMPONENT.SEARCH]: 'Search presentations',

    [LECTURE_STOP_BUTTON_COMPONENT.END]: 'End presentation',
    [LECTURE_STOP_BUTTON_COMPONENT.ENDING]: 'Ending presentation...',

    [LIVE_PRESENTATION_QUESTIONS_COMPONENT.ANONYMITY]:
      "Other participants won't see your name on the question.",
    [LIVE_PRESENTATION_QUESTIONS_COMPONENT.NO_QUESTIONS]:
      'Nobody has asked any questions during this presentation.',
    [LIVE_PRESENTATION_QUESTIONS_COMPONENT.LECTURE_PRESENTATION_BEGINS]:
      "You'll be able to ask questions once the presentation begins.",

    [NAV_ADMIN_MENU_COMPONENT.COURSE_MEETING_DEPT_MANAGEMENT]:
      'Meeting & Department Management',

    [NAV_INSTRUCTOR_MENU_COMPONENT.INSTRUCTOR_PRESENTER_TOOLS]:
      'Presenter Tools',
    [NAV_INSTRUCTOR_MENU_COMPONENT.COURSE_MEETING_MANAGEMENT]:
      'Meeting Management',

    [PARTICIPANT_OVERVIEW_COMPONENT.ERROR]:
      'There was a problem getting meeting participation information.  Please try refreshing the page.',

    [POLL_REVIEWER_COMPONENT.NOT_ENDED]:
      'Polling information will be available after this presentation has ended.',

    [SERIES_DOCUMENTS.NONE]:
      'There are no documents associated with this meeting.',
  },
};

export default corpVersionLanguage;
