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

const edVersionLanguage = {
  en: {
    // App-wide strings
    [GENERAL_COMPONENT.INSTRUCTOR_PRESENTER]: 'Presenter',
    [GENERAL_COMPONENT.INSTRUCTORS_PRESENTERS]: 'Presenters',
    [GENERAL_COMPONENT.ADD_INSTRUCTOR_PRESENTER]: 'Add Presenter',
    [GENERAL_COMPONENT.STUDENT_PARTICIPANT]: 'User',
    [GENERAL_COMPONENT.STUDENTS_PARTICIPANTS]: 'Users',
    [GENERAL_COMPONENT.REGISTERED_PARTICIPANTS]: 'Registered Users',
    [GENERAL_COMPONENT.UNREGISTERED_PARTICIPANTS]: 'Unregistered Users',
    [GENERAL_COMPONENT.DISTROLIST_INVITATIONS]:
      'No distribution lists in ed version',
    [GENERAL_COMPONENT.ADD_STUDENT_PARTICIPANT]: 'Add User',
    [GENERAL_COMPONENT.STUDENT_COURSES_PARTICIPANT_MEETINGS]: 'User Courses',
    [GENERAL_COMPONENT.COURSE_MEETING]: 'Course',
    [GENERAL_COMPONENT.COURSES_MEETINGS]: 'Courses',
    [GENERAL_COMPONENT.NO_COURSES_MEETINGS]: 'No Courses Found...',
    [GENERAL_COMPONENT.ALL_COURSES_MEETINGS]: 'All Presentations',
    [GENERAL_COMPONENT.TOP_COURSES_MEETINGS]: 'Top Courses',
    [GENERAL_COMPONENT.COURSE_MEETING_GROUPS]: 'Groups',
    [GENERAL_COMPONENT.COURSE_MEETING_NAME]: 'Course Name',
    [GENERAL_COMPONENT.LECTURE_PRESENTATION]: 'Presentations',
    [GENERAL_COMPONENT.LECTURES_PRESENTATIONS]: 'Presentations',
    [GENERAL_COMPONENT.UNNAMED_LECTURE_PRESENTATION]: 'Unnamed Presentations',
    [GENERAL_COMPONENT.LOADING_LECTURES_PRESENTATIONS]: 'Getting Presentations...',
    [GENERAL_COMPONENT.ERROR_LECTURES_PRESENTATIONS]:
      'There was a problem getting your Presentations.  Please try refreshing the page.',
    [GENERAL_COMPONENT.NONE_LECTURES_PRESENTATIONS_COURSE_MEETING]:
      "There aren't any Presentations for this course, yet.",
    [GENERAL_COMPONENT.NO_PRESENTATION_LECTURE_PRESENTATION]:
      'There is no presentation for this lecture.',
    [GENERAL_COMPONENT.STUDENT_PARTICIPANT_QUESTIONS]: 'User Questions',
    [GENERAL_COMPONENT.ERROR_STUDENT_PARTICIPANT_QUESTIONS]:
      'There was a problem getting user questions.  Please try refreshing the page.',
    [GENERAL_COMPONENT.LOADING_STUDENT_PARTICIPANT_QUESTIONS]:
      'Getting user questions...',
    [GENERAL_COMPONENT.NONE_STUDENT_PARTICIPANT_QUESTIONS]:
      "There aren't any questions for this course.",
    [GENERAL_COMPONENT.LOADING_COURSE_MEETING]: 'Getting course information...',
    [GENERAL_COMPONENT.LOADING_COURSES_MEETINGS]: 'Getting courses',
    [GENERAL_COMPONENT.ERROR_COURSE_MEETING]:
      'There was an error getting this course.',
    [GENERAL_COMPONENT.ERROR_COURSES_MEETINGS]:
      'There was an error getting course information',

    [GENERAL_COMPONENT.NO_PARTICIPATION]:
      'Course participation information will be available after presentations have occurred.',
    [GENERAL_COMPONENT.PARTICIPATION_PRESENTATION_DESCRIPTION]:
      'Participation is the measurement of Users in the course (at the time of presentation) who viewed at least one segment of this live presentation.',
    [GENERAL_COMPONENT.PARTICIPATION_PRESENTATIONS_DESCRIPTION]:
      'Participation is the measurement of users in the course (at the time of presentation) who viewed at least one segment of live presentations.',
    [GENERAL_COMPONENT.NO_QUESTIONS_LECTURE_PRESENTATION]:
      "There aren't any questions for this Presentation.",
    [GENERAL_COMPONENT.NO_QUESTIONS_COURSE_MEETING]:
      "There aren't any questions for this course.",
    [GENERAL_COMPONENT.QUESTIONS_COURSE_MEETING_ERROR]:
      'There was a problem getting questions for this course.  Please try refreshing the page.',
    [GENERAL_COMPONENT.POLL_PRESENTATION_DESCRIPTION]:
      'Polling rates are the measurement of how many of the participating users answered all polls in this presentation.',
    [GENERAL_COMPONENT.POLL_PRESENTATIONS_DESCRIPTION]:
      'Polling rates are the measurement of how many of the participating users answered polls asked during live presentations.',
    [GENERAL_COMPONENT.YOUR_COURSE_MEETING_PARTICIPATION]:
      'Your Course Participation',
    [GENERAL_COMPONENT.COURSE_MEETING_PARTICIPATION]: 'Course Participation',

    // Text in multiple tables
    [GENERAL_TABLES.COURSE_MEETING_PARTICIPATION]: 'Course Participation',
    [GENERAL_TABLES.LECTURE_PRESENTATION_PARTICIPATION]:
      'Presentation Participation',
    [GENERAL_TABLES.LECTURES_PRESENTATIONS_VIEWED]: 'Presentations viewed',
    [GENERAL_TABLES.NOT_YET_IN_COURSE_MEETING]: 'Not yet in course',

    // Component-specific strings
    [ADD_COURSE_POPOVER_COMPONENT.BUTTON_LABEL]: 'Add Presentations',
    [ADD_COURSE_POPOVER_COMPONENT.POPOVER_TITLE]: 'Add new course',
    [ADD_COURSE_POPOVER_COMPONENT.PLACEHOLDER]: 'Course name',
    [ADD_COURSE_POPOVER_COMPONENT.ERROR_NAME]:
      'Please enter a valid course name',
    [ADD_COURSE_POPOVER_COMPONENT.LOADING]: 'Adding course...',
    [ADD_COURSE_POPOVER_COMPONENT.ERROR_SAVING]:
      'There was a problem adding this course.  Try later.',

    [ADD_EMAIL_POPOVER_COMPONENT.DESCRIPTION_INSTRUCTOR_PRESENTER]:
      'Add instructor by email (unregistered users will be sent an invitation to join NoteAffect)',
    [ADD_EMAIL_POPOVER_COMPONENT.DESCRIPTION_STUDENT_PARTICIPANT]:
      'Add user by email (unregistered users will be sent an invitation to join NoteAffect)',

    [ARBITRARY_GROUP_LAYOUT_COMPONENT.SEARCH_COURSES_MEETINGS]:
      'Search Presentations',

    [ARBITRARY_GROUP_DETAIL_COMPONENT.COURSES_MEETINGS_TAB]: 'Presentations',

    [ARBITRARY_GROUP_COURSES_COMPONENT.ERROR]:
      'There are no Presentations available in this group.',

    [ASK_QUESTION_POPOVER_COMPONENT.UNSEEN_QUESTION]:
      "Other users won't see your name on the question.",
    [ASK_QUESTION_POPOVER_COMPONENT.QUESTION_COURSE_MEETING]:
      'Ask a question about this course',
    [ASK_QUESTION_POPOVER_COMPONENT.QUESTION_LECTURE_PRESENTATION]:
      'Ask a question about this Presentation',
    [ASK_QUESTION_POPOVER_COMPONENT.QUESTION_SEGMENT]:
      'Ask a question about this segment',

    [COURSES_COMPONENT.TITLE]: 'Your Presentations',
    [COURSES_COMPONENT.CURRENT]: 'Presentations',
    [COURSES_COMPONENT.UPCOMING]: 'Upcoming Courses',
    [COURSES_COMPONENT.PREVIOUS]: 'Previous Courses',
    [COURSES_COMPONENT.UNREGISTERED]: "You aren't registered for any presentations.",

    [COURSE_ANALYTICS_COMPONENT.TITLE]: 'Course Analytics',
    [COURSE_ANALYTICS_COMPONENT.LOADING]: 'Getting course analytics...',
    [COURSE_ANALYTICS_COMPONENT.LECTURES_ERROR]:
      'There was an error getting your Presentations.',
    [COURSE_ANALYTICS_COMPONENT.DOCUMENTS_ERROR]:
      'There was an error getting your documents',
    [COURSE_ANALYTICS_COMPONENT.ANALYTICS_ERROR]:
      'Your analytics have not yet completed processing or not enough data has been collected to provide you with meaningful data. Please check back later.',
    [COURSE_ANALYTICS_COMPONENT.NONE]:
      'There have been no Presentations in this course. Analysis of your Presentations will be available after you have completed a Presentation.',
    [COURSE_ANALYTICS_COMPONENT.NO_DOCUMENTS]:
      'There are no documents associated with this course',

    [COURSE_ANALYTICS_TRENDS_COMPONENT.TITLE]: 'Presentation Trends',
    [COURSE_ANALYTICS_TRENDS_COMPONENT.NONE]:
      'Course trends will be available after you have completed at least two Presentations.',

    [COURSE_DETAIL_COMPONENT.TITLE]: 'Course Overview',
    [COURSE_DETAIL_COMPONENT.LECTURES_ERROR]:
      'There was a problem getting your course overview information.',
    [COURSE_DETAIL_COMPONENT.OVERVIEW_ERROR]:
      'There was a problem getting your course overview information. Check back soon',
    [COURSE_DETAIL_COMPONENT.NO_OVERVIEW]:
      'There was a problem getting your course participation information.  Please try refreshing the page.',

    [COURSE_ENGAGEMENT_COMPONENT.TITLE]: 'Course Engagement',
    [COURSE_ENGAGEMENT_COMPONENT.ERROR]:
      'Your analytics have not yet completed processing or not enough data has been collected to provide you with meaningful data. Please check back later.',

    [COURSE_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS]:
      'No polls have been asked in this course',

    [COURSE_PARTICIPANTS_COMPONENT.TITLE]: 'Course Users',
    [COURSE_PARTICIPANTS_COMPONENT.LOADING]: 'Getting user information...',
    [COURSE_PARTICIPANTS_COMPONENT.ERROR]:
      "There was an error retrieving user information.  Viewing analytics won't be possible.",

    [DEPARTMENTS_COMPONENT.COURSES_MEETINGS_DEPTS]: 'Courses & Depts.',

    [DEPARTMENT_COURSE_PARTICIPANT_COMPONENT.REMOVE]: 'Remove',
    [DEPARTMENT_COURSE_PARTICIPANT_COMPONENT.PROMOTE]: 'Make Presenter',

    [DEPARTMENT_EDIT_DEPARTMENT_COMPONENT.SUBTITLE]:
      'Select the desired department for this course:',

    [EDIT_PARTICIPANTS_COMPONENT.TITLE_ADD]: 'Edit Course Users',
    [EDIT_PARTICIPANTS_COMPONENT.TITLE_EDIT]: 'Edit Course Users',
    [EDIT_PARTICIPANTS_COMPONENT.NO_PARTICIPANTS]:
      'There are currently no registered users for this course.',
    [EDIT_PARTICIPANTS_COMPONENT.INVITED]:
      'The requested participants have been added or invited to this course.',

    [EDIT_PERIOD_DIALOG_COMPONENT.SELECT]:
      'Select the desired department for this course:',

    [GROUP_ANALYTICS_COMPONENT.NO_PRESENTATIONS]:
      'There have been no presentations in this group. Analytics information for courses will be available after one or more courses have completed a presentation.',

    [GROUP_ENGAGEMENT_COMPONENT.ERROR]:
      'There was a problem getting engagement information, or not enough data has been collected to provide you with meaningful data. Please check back after one or more courses have completed a presentation.',
    [GROUP_ENGAGEMENT_COMPONENT.NO_PRESENTATIONS]:
      'There have been no presentations in this group. Engagement information for courses will be available after one or more courses have completed a presentation.',

    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_ENGAGEMENT]:
      'Top Courses for Engagement',
    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_PARTICIPATION]:
      'Top Courses for Participation',
    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS]:
      'No polls have been asked in any course in this group',
    [GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_POLLING]:
      'Top Courses for Polling Answers',

    [GROUPS_VIEW_COMPONENT.DESCRIPTION]:
      'Use Course Groups to build powerful custom selections of courses.  Each group has all engagement and analytics information aggregated for review and can be used to segment your presentations in any way you see fit, such as by campus, by discipline, by day of week, or any grouping you desire.',

    [INSTRUCTOR_COURSES_COMPONENT.COURSE_MEETING_MANAGEMENT]:
      'Event Management',

    [INSTRUCTOR_COURSE_LECTURES_COMPONENT.START_NEW]: 'Start new Presentation',
    [INSTRUCTOR_COURSE_LECTURES_COMPONENT.BROADCASTER]:
      'Waiting for your Presentation to begin...',

    [INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.QUESTIONS_TITLE]:
      'Presentation Questions',
    [INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.NO_SEGMENTS]:
      'There are no segments for this Presentation.',
    [INSTRUCTOR_LECTURE_REVIEWER_COMPONENT.QUESTION_ERROR]:
      'There was a problem getting questions for this Presentation.',

    [INSTRUCTOR_PRESENTATION_PLAYBACK_CONTROLS_COMPONENT.SHARED_AUDIO]:
      'Audio shared with users',

    [LECTURE_DETAIL_COMPONENT.TITLE]: 'Choose a Presentation',
    [LECTURE_DETAIL_COMPONENT.DESCRIPTION]:
      'Please choose a Presentation from the menu.',

    [LECTURE_ENGAGEMENT_COMPONENT.NO_SEGMENTS]:
      'There were no segments presented during this Presentation.',
    [LECTURE_ENGAGEMENT_COMPONENT.NO_POLLS]:
      'There were no polls asked during this Presentation.',
    [LECTURE_ENGAGEMENT_COMPONENT.NO_PARTICIPATION]:
      'No users participated in this Presentation.',
    [LECTURE_ENGAGEMENT_COMPONENT.NON_PARTICIPATING]:
      'There were no non-participating users',
    [LECTURE_ENGAGEMENT_COMPONENT.NON_PARTICIPATING_TITLE]:
      'Non-participating users',
    [LECTURE_ENGAGEMENT_COMPONENT.NOT_IN_COURSE_MEETING]:
      'Users not yet in course',
    [LECTURE_ENGAGEMENT_COMPONENT.NOT_YET_ACTIVE]:
      'There were no not-yet-active users',
    [LECTURE_ENGAGEMENT_COMPONENT.PARTICIPANTS]: 'Participating users',

    [LECTURE_RENAME_POPUP_COMPONENT.TITLE]: 'Rename Presentation',

    [LECTURE_SEARCH_AND_SORT_COMPONENT.SEARCH]: 'Search Presentations',

    [LECTURE_STOP_BUTTON_COMPONENT.END]: 'End Presentation',
    [LECTURE_STOP_BUTTON_COMPONENT.ENDING]: 'Ending Presentation...',

    [LIVE_PRESENTATION_QUESTIONS_COMPONENT.ANONYMITY]:
      "Other users won't see your name on the question.",
    [LIVE_PRESENTATION_QUESTIONS_COMPONENT.NO_QUESTIONS]:
      'Nobody has asked any questions during this Presentation.',
    [LIVE_PRESENTATION_QUESTIONS_COMPONENT.LECTURE_PRESENTATION_BEGINS]:
      "You'll be able to ask questions once the Presentation begins.",

    [NAV_ADMIN_MENU_COMPONENT.COURSE_MEETING_DEPT_MANAGEMENT]:
      'Course & Department Management',

    [NAV_INSTRUCTOR_MENU_COMPONENT.INSTRUCTOR_PRESENTER_TOOLS]:
      'Presenter Tools',
    [NAV_INSTRUCTOR_MENU_COMPONENT.COURSE_MEETING_MANAGEMENT]:
      'Event Management',

    [PARTICIPANT_OVERVIEW_COMPONENT.ERROR]:
      'There was a problem getting course participation information.  Please try refreshing the page.',

    [POLL_REVIEWER_COMPONENT.NOT_ENDED]:
      'Polling information will be available after this Presentation has ended.',

    [SERIES_DOCUMENTS.NONE]:
      'There are no documents associated with this Presentation.',
  },
};

export default edVersionLanguage;
