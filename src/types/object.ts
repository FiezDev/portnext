export type SideProjectObj = {
  projectName: string;
  projectDesc: string[];
  projectIntro?: string;
  pic?: string[];
  stack: string[];
  ghlink: string;
  weblink: string;
  apilink?: string;
};

export type CaseStudy = {
  problem: string; // the context / challenge
  role: string; // what the developer specifically owned
  approach: string[]; // key technical decisions / architecture choices
  highlights?: string[]; // notable things built (falls back to projectDesc)
  outcome: string; // impact — may contain {{FILL IN}} placeholders to complete later
  timeline?: string; // e.g. "2024 – 2025"
  liveUrl?: string;
  repoUrl?: string;
};

export type WorkProjectObj = {
  projectName: string;
  projectFullName?: string;
  projectIntro?: string;
  projectDesc: string[];
  stack: string[];
  projectID: number;
  projectType: string;
  createDate: number;
  updateDate?: number;
  projectPic: {
    picurl: {
      pic: string[];
      width: number;
      height: number;
    };
    picthumb?: {
      pic: string[];
      width: number;
      height: number;
    };
    picicon?: {
      pic: string[];
      width: number;
      height: number;
    };
  };
  activeFlag: boolean;
  status: string;
  caseStudy?: CaseStudy;
};

export type contact = {
  name: string;
  email: string;
  message: string;
  reply: string;
  date: number;
};

export type Contacts = Array<contact>;

export type chatroom = {
  roomname: string;
  Name: string;
  Message: [
    {
      side: string;
      text: string;
      time: number;
    }
  ];
  status: string;
  date: number;
};
