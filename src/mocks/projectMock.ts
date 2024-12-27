import { SideProjectObj, WorkProjectObj } from '@/src/types/object';

export const WorkProjects: WorkProjectObj[] = [
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

export const SideProjects: SideProjectObj[] = [
  {
    projectName: 'PortFolio FrontEnd',
    projectIntro: 'A web application showcasing my work and projects.',
    stack: [
      'Typescript',
      'React',
      'Next.js',
      'Tailwindcss',
      'Firebase',
      'Vercel',
      'Shadcn',
      'Imgix',
    ],
    projectDesc: [
      'A central hub to showcase all my work, built with Next.js and TypeScript. Styled using Tailwind CSS and ShadCN, with images hosted on Imgix CDN and Google Storage. The application is deployed on Vercel.',
    ],
    ghlink: 'github.com/FiezDev/portnext',
    weblink: 'fiez.dev/portfolio',
  },
  {
    projectName: 'PortFolio BackEnd',
    projectIntro: 'A Django-based backend for LangChain integration.',
    stack: [
      'Python',
      'Django',
      'LangChain',
      'NeonDB',
      'PostgreSQL',
      'AWS EC2',
      'Swagger',
    ],
    projectDesc: [
      'A Python backend hosted on AWS EC2 with PostgreSQL using NeonDB. It provides REST API endpoints and integrates LangChain for future AI projects.',
    ],
    ghlink: '',
    weblink: '',
  },
  {
    projectName: 'FlightClone',
    projectIntro: 'A mini-site for searching airport flights.',
    stack: [
      'React',
      'TypeScript',
      'MUI',
      'Zod',
      'nuqs',
      'ReactQuery',
      'ReactHookForm',
      'AmadeusApi',
    ],
    projectDesc: [
      'A mini-site built to explore consuming complex API endpoints and experiment with new React concepts. It integrates the Amadeus API for flight search functionality.',
    ],
    ghlink: 'github.com/FiezDev/FlightClone',
    weblink: 'flight-clone.vercel.app',
    apilink: 'developers.amadeus.com/self-service/category/flights',
  },
];
