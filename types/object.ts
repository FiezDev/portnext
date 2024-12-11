export type project = {
    projectID: number;
    projectType: string;
    projectName: string;
    projectFullName?: string;
    projectIntro?: string;
    projectDesc: string[];
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
    createDate: number;
    updateDate?: number;
    activeFlag: boolean;
    status: string;
    stack: string[];
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