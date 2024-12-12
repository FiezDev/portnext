import { project } from '@/types/object';

export const projectsData: project[] = [
  {
    stack: ['VueJS', 'Vuetify', 'C#', 'MySQL'],
    projectID: 1,
    projectIntro: 'Short URL Service Website',
    updateDate: 1662146433881,
    status: 'Finish',
    createDate: 1662146433881,
    projectFullName: '',
    projectPic: {
      picurl: {
        height: 600,
        width: 800,
        pic: [
          'screenshot/projectone1.jpg',
          'screenshot/projectone2.jpg',
          'screenshot/projectone3.jpg',
        ],
      },
    },
    projectType: 'Work',
    projectName: 'Short URL Service Website',
    projectDesc: [
      '- Work closely with UX/UI designers to execute both front-end and back-end features of the Admin Panel for enterprise and corporate clients.',
    ],
    activeFlag: true,
  },
  {
    projectName: 'Health Insurance WebApp',
    activeFlag: true,
    status: 'Finish',
    projectPic: {
      picurl: {
        width: 400,
        height: 300,
        pic: ['screenshot/projecttwo1.jpg'],
      },
    },
    projectDesc: [
      '- Perform debugging and ongoing maintenance for the application.',
      '- Resolve UI inconsistencies and responsiveness issues.',
      '- Roll out new functionalities such as user authentication, customer analytics reports, and coupon systems.',
      '- Provide customer support for application-related issues and feature inquiries.',
    ],
    projectIntro: 'Health Insurance WebApp',
    projectType: 'Work',
    createDate: 1662146547653,
    stack: ['AngularJS', 'Typescript', 'PrimeNG', 'C#', 'MySQL'],
    projectID: 2,
    projectFullName: '',
    updateDate: 1662146547653,
  },
  {
    projectFullName: '',
    projectType: 'Work',
    createDate: 1662146685746,
    activeFlag: true,
    projectIntro: 'Taxi Service App',
    updateDate: 1662146685746,
    projectID: 3,
    stack: ['VueJS', 'Vuetify', 'Typescript', 'Flutter', 'C#', 'Firebase'],
    projectName: 'Taxi Service App',
    projectPic: {
      picurl: {
        height: 300,
        pic: ['screenshot/projectthree1.jpg'],
        width: 400,
      },
    },
    projectDesc: [
      '- Implement a front-end component for Navigation and Driver Ratings.',
      '- Develop a reusable front-end widget based on Adobe XD designs, compatible across multiple application features.',
      '- Integrate CRUD operations for Driver and Vehicle information into the Admin Dashboard',
    ],
    status: 'Finish',
  },
  {
    projectDesc: [
      '- Construct the darkphoenix project architecture and develop the UX/UI from scratch to a production-ready state, using the DataTables library.',
      '- Revise the database schema, refactor existing code, develop and update APIs, and deploy the entire system to Google Cloud Platform to enhance overall workflow efficiency and system effectiveness.',
    ],
    projectFullName: '',
    updateDate: 1697999736000,
    projectID: 4,
    projectIntro: 'NestIFly CRM/API',
    projectName: 'Darkphoenix/Blackbird',
    projectPic: {
      picurl: {
        height: 300,
        width: 400,
        pic: [
          'screenshot/projectfour1.jpg',
          'screenshot/projectfour2.jpg',
          'screenshot/projectfour3.jpg',
        ],
      },
    },
    projectType: 'Work',
    createDate: 1697999736000,
    activeFlag: true,
    stack: [
      'Python',
      'Django',
      'Javascript',
      'jQuery',
      'Tailwindcss',
      'Datatables',
      'MySql',
      'GCP',
    ],
    status: 'Finish',
  },
  {
    projectDesc: [
      '- Manage application maintenance on the App Store and Google Play, including handling tester licenses and setting up testing environments.',
      '- Consistently roll out new features on a regular basis.',
      '- Engage in ongoing development, issue resolution, and code refactoring to enhance functionality and usability, aiming to optimize the user experience.',
    ],
    status: 'Finish',
    activeFlag: true,
    projectName: 'Bluebird',
    projectPic: {
      picurl: {
        width: 150,
        pic: [
          'screenshot/projectfive1.jpg',
          'screenshot/projectfive2.jpg',
          'screenshot/projectfive3.jpg',
        ],
        height: 300,
      },
    },
    projectIntro: 'Stocklend Application',
    projectType: 'Work',
    updateDate: 1697999736000,
    stack: ['Javascript', 'React', 'ReactNative', 'NativeBase'],
    projectFullName: '',
    projectID: 5,
    createDate: 1697999736000,
  },
];
