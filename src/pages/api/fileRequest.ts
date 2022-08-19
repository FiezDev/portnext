import ImgixClient from '@imgix/js-core';

enum SERVER_TYPE {
  Firebase,
  Vercel,
  Imgix,
  MongoDB,
  AWS,
  PostgreSQL,
}

enum REQ_TYPE {
  all,
  single,
}

const baseFirestore =
  'https://firebasestorage.googleapis.com/v0/b/fiezport.appspot.com/o/';

const FirestoreFile = {
  baseFirestore,
  resumepdf: `${baseFirestore}cv%2FITTI_RESUME_2022_Rev02.pdf?alt=media&token=5b9d4403-ab3f-4fde-bfd6-9416013f6dc0`,
  resumejpg: `${baseFirestore}cv%2FITTI_RESUME_2022_Rev02.jpg?alt=media&token=2b07be42-3401-4dda-91f8-75ad7ce7acc2`,
};

const ImgixImage = {
  //logo
  logo: signURL('FFLogoW.png'),
  bg4k: signURL('4kbg.jpeg'),
  //bg
  //resume
  cv_resumepdf: signURL('cv/ITTI_RESUME_2022_Rev02.pdf'),
  cv_esumejpg: signURL('cv/ITTI_RESUME_2022_Rev02.jpg'),
  //icon
  icon_close: signURL('icon/close.svg'),
  icon_ham: signURL('icon/ham.svg'),
  icon_react: signURL('icon/react.svg'),
  icon_codepen: signURL('icon/codepen.svg'),
  icon_github: signURL('icon/github.svg'),
  icon_typescript: signURL('icon/typescript.svg'),
  icon_tailwindcss: signURL('icon/tailwindcss.svg'),
  icon_vite: signURL('icon/vite.svg'),
  icon_firebase: signURL('icon/firebase.svg'),
  icon_nextjs: signURL('icon/nextjs.svg'),
  //profilepic
  profilepic_me: signURL('profilepic/Me.png'),
  profilepic_me2: signURL('profilepic/Me2.png'),
  profilepic_meabout: signURL('profilepic/meabout.jpg'),
  profilepic_faceMe: signURL('profilepic/faceMe.jpg'),
  profilepic_faceMeEff: signURL('profilepic/faceMeEff.jpg'),
  profilepic_guy: signURL('profilepic/guy.jpg'),
  profilepic_devBg: signURL('profilepic/devBg.jpg'),
  profilepic_workBg1: signURL('profilepic/workBg1.jpg'),
  profilepic_workBg2: signURL('profilepic/workBg2.jpg'),
  profilepic_workBg3: signURL('profilepic/workBg3.jpg'),
  //misc
  main_avatar1: signURL('avatar1.jpg'),
  main_avatar2: signURL('avatar2.jpg'),
  main_avatar3: signURL('avatar3.jpg'),
  main_portfolio1: signURL('portfolio1.jpg'),
  main_portfolio2: signURL('portfolio2.jpg'),
  main_portfolio3: signURL('portfolio3.jpg'),
  main_portfolio4: signURL('portfolio4.jpg'),
  main_portfolio5: signURL('portfolio5.jpg'),
  main_portfolio6: signURL('portfolio6.jpg'),
  main_blog: signURL('blog.jpeg'),
  main_admin: signURL('admin.jpeg'),
  //error
  error_404: signURL('error/404.jpeg'),
  error_wuc: signURL('error/WUC.png'),
};

function signURL(url: string) {
  let client = new ImgixClient({
    domain: 'fiez.imgix.net',
    secureURLToken: 'cYYgCR2CuHuXZ2n4',
    includeLibraryParam: false,
  });
  let allUrl = client.buildURL(url, {});
  return allUrl;
}

function signURLParam(url: string, param: string) {
  let client = new ImgixClient({
    domain: 'fiez.imgix.net',
    secureURLToken: 'cYYgCR2CuHuXZ2n4',
    includeLibraryParam: false,
  });
  let allUrl = client.buildURL(url, param);
  return allUrl;
}

export default function handler(
  server_type: SERVER_TYPE,
  req_type: REQ_TYPE,
  url: string | undefined,
  param: string | undefined
) {
  switch (server_type) {
    case SERVER_TYPE.Firebase:
      return FirestoreFile;
    case SERVER_TYPE.Imgix:
      {
        if (req_type == REQ_TYPE.all) {
          return ImgixImage;
        }
        if (
          req_type == REQ_TYPE.single &&
          url != undefined &&
          param != undefined
        ) {
          return signURLParam(url, param);
        }
      }
      break;
  }
}

export const config = {
  runtime: 'experimental-edge',
};
