const baseurl =
  'https://firebasestorage.googleapis.com/v0/b/fiezport.appspot.com/o/';
const baseImgix = '';

export const FirestoreFile = {
  baseurl,
  resumepdf: `${baseurl}cv%2FITTI_RESUME_2022_Rev02.pdf?alt=media&token=5b9d4403-ab3f-4fde-bfd6-9416013f6dc0`,
  resumejpg: `${baseurl}cv%2FITTI_RESUME_2022_Rev02.jpg?alt=media&token=2b07be42-3401-4dda-91f8-75ad7ce7acc2`,
};

export const ImgixImage = {
  baseImgix,
  //logo
  logo: `${baseImgix}FFLogoW.png`,
  //resume
  cv_resumepdf: `${baseImgix}cv/ITTI_RESUME_2022_Rev02.pdf`,
  cv_esumejpg: `${baseImgix}cv/ITTI_RESUME_2022_Rev02.jpg`,
  //icon
  icon_close: `${baseImgix}icon/close.svg`,
  icon_ham: `${baseImgix}icon/ham.svg`,
  icon_react: `${baseImgix}icon/react.svg`,
  icon_codepen: `${baseImgix}icon/codepen.svg`,
  icon_github: `${baseImgix}icon/github.svg`,
  icon_typescript: `${baseImgix}icon/typescript.svg`,
  icon_tailwindcss: `${baseImgix}icon/tailwindcss.svg`,
  icon_vite: `${baseImgix}icon/vite.svg`,
  icon_firebase: `${baseImgix}icon/firebase.svg`,
  icon_nextjs: `${baseImgix}icon/nextjs.svg`,
  //profilepic
  profilepic_me: `${baseImgix}profilepic/Me.png`,
  profilepic_me2: `${baseImgix}profilepic/Me2.png`,
  profilepic_meabout: `${baseImgix}profilepic/meabout.jpg`,
  profilepic_faceMe: `${baseImgix}profilepic/faceMe.jpg`,
  profilepic_faceMeEff: `${baseImgix}profilepic/faceMeEff.jpg`,
  profilepic_guy: `${baseImgix}profilepic/guy.jpg`,
  profilepic_devBg: `${baseImgix}profilepic/devBg.jpg`,
  profilepic_workBg1: `${baseImgix}profilepic/workBg1.jpg`,
  profilepic_workBg2: `${baseImgix}profilepic/workBg2.jpg`,
  profilepic_workBg3: `${baseImgix}profilepic/workBg3.jpg`,
  //misc
  main_avatar1: `${baseImgix}avatar1.jpg`,
  main_avatar2: `${baseImgix}avatar2.jpg`,
  main_avatar3: `${baseImgix}avatar3.jpg`,
  main_portfolio1: `${baseImgix}portfolio1.jpg`,
  main_portfolio2: `${baseImgix}portfolio2.jpg`,
  main_portfolio3: `${baseImgix}portfolio3.jpg`,
  main_portfolio4: `${baseImgix}portfolio4.jpg`,
  main_portfolio5: `${baseImgix}portfolio5.jpg`,
  main_portfolio6: `${baseImgix}portfolio6.jpg`,
  //error cat
  errorcat_404: `${baseImgix}error/404.jpeg`,
};
