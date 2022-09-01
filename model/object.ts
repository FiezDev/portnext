import { ReactElement } from 'react';

export type project = {
  projectID: number;
  projectType: string;
  projectName: string;
  projectFullName?: string;
  projectIntro?: string;
  projectDesc: ReactElement;
  projectPic: {
    picurl: {
      pic: string;
      width: number;
      height: number;
    };
    picthumb?: {
      pic: string;
      width: number;
      height: number;
    };
    picicon?: {
      pic: string;
      width: number;
      height: number;
    };
  };
  createDate: string;
  updateDate?: string;
  activeFlag: boolean;
  status: string;
  stack: string[];
};

export type Projects = Array<project>;
