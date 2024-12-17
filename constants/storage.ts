const baseurl = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL;
const baseImgix = process.env.NEXT_PUBLIC_IMGIX_URL;

export const FirestoreFile = {
  baseurl,
  resumepdf: `${baseurl}cv%2FITTI_RESUME_2022_Rev02.pdf?alt=media&token=5b9d4403-ab3f-4fde-bfd6-9416013f6dc0`,
  resumejpg: `${baseurl}cv%2FITTI_RESUME_2022_Rev02.jpg?alt=media&token=2b07be42-3401-4dda-91f8-75ad7ce7acc2`,
};

export const ImgixImage = {
  baseImgix,
  //logo
  logo: `${baseImgix}FFLogoW.png`,
  bg4k: `${baseImgix}4kbg.jpeg`,
  //bg
  //resume
  resume_pdf: `${baseImgix}cv/ITTI_Resume.pdf`,
  cv_pdf0: `${baseImgix}cv/ittipol_cv_v0.pdf`,
  cv_pdf2: `${baseImgix}cv/ittipol_cv_v2.pdf`,
  resumepdf: `${baseImgix}cv/resume.pdf`,
  resumecompdf: `${baseImgix}cv/resume_com.pdf`,

  //icon
  icon_close: `${baseImgix}icon/close.svg`,
  icon_ham: `${baseImgix}icon/ham.svg`,
  icon_html: `${baseImgix}icon/html.svg`,
  icon_css: `${baseImgix}icon/css.svg`,
  icon_javascript: `${baseImgix}icon/javascript.svg`,
  icon_typescript: `${baseImgix}icon/typescript.svg`,
  icon_dart: `${baseImgix}icon/dart.svg`,
  icon_flutter: `${baseImgix}icon/flutter.svg`,
  icon_csharp: `${baseImgix}icon/csharp.svg`,
  icon_angular: `${baseImgix}icon/angular.svg`,
  icon_react: `${baseImgix}icon/react.svg`,
  icon_vue: `${baseImgix}icon/vue.svg`,
  icon_tailwindcss: `${baseImgix}icon/tailwindcss.svg`,
  icon_firebase: `${baseImgix}icon/firebase.svg`,
  icon_vercel: `${baseImgix}icon/vercel.svg`,
  icon_nextjs: `${baseImgix}icon/next.svg`,
  icon_python: `${baseImgix}icon/python.svg`,
  icon_django: `${baseImgix}icon/django.svg`,
  icon_jquery: `${baseImgix}icon/jquery.svg`,
  icon_gcp: `${baseImgix}icon/gcp.svg`,

  //profilepic
  profilepic_NewMe: `${baseImgix}profilepic/HalfMe1.png?w=871&h=1303&auto=undefined%2Cenhance%2Ccompress&fit=crop`,
  profilepic_NewMeEff: `${baseImgix}profilepic/HalfMe2.png?w=871&h=1303&auto=undefined%2Cenhance%2Ccompress&fit=crop`,

  //fit=crop?crop=bottom,right&min-w=300&h=1906
  profilepic_me2: `${baseImgix}profilepic/Me2.png`,
  profilepic_meabout: `${baseImgix}profilepic/meabout.jpg`,
  profilepic_faceMe: `${baseImgix}profilepic/halfme.jpeg`,
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
  main_blog: `${baseImgix}blog.jpeg`,
  main_admin: `${baseImgix}admin.jpeg`,
  main_blueline: `${baseImgix}BlueLine.png`,
  main_chat: `${baseImgix}chat.svg`,
  main_send: `${baseImgix}send.png`,

  //error
  error_404: `${baseImgix}error/404.jpeg`,
  error_wuc: `${baseImgix}error/WUC.png`,

  ///screenshot
  screenshot_project1_1: `${baseImgix}screenshot/projectone1.jpeg`,
  screenshot_project1_2: `${baseImgix}screenshot/projectone2.jpeg`,
  screenshot_project1_3: `${baseImgix}screenshot/projectone3.jpeg`,
  screenshot_project2_1: `${baseImgix}screenshot/projecttwo1.jpeg`,
  screenshot_project3_1: `${baseImgix}screenshot/projectthree1.jpeg`,
};
