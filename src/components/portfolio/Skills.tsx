import React from 'react';
import Image from 'next/image';
import { ImgixImage } from '@/model/storage';

type Props = {};

const skills = (props: Props) => {
  // const saveFile = () => {
  //   // const resume = getStorage("cv/ITTI_RESUME_2022_Rev02.pdf");
  //   // console.log(resume);
  //   // const blob = new Blob(resume, {type: "application/octetstream"});

  //   saveAs(Firestore.resumepdf, "ITTIPOL_RESUME.pdf");
  // };
  return (
    <div className="text-gray-400 bg-gray-900 body-font lg:mx-[20vw] md:mx-[10vw] mx-[5vw]">
      <div className="lg:container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 md:mb-0 mb-10">
          <Image
            className="object-cover object-center rounded"
            src={ImgixImage.profilepic_meabout}
            width={1000}
            height={1000}
            alt="https://dummyimage.com/1000x1000"
          />
        </div>

        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">
            Before they sold out
            <br className="hidden lg:inline-block" />
            readymade gluten
          </h1>
          <p className="text-white mb-8 leading-relaxed">
            Copper mug try-hard pitchfork pour-over freegan heirloom neutra air
            plant cold-pressed tacos poke beard tote bag. Heirloom echo park
            mlkshk tote bag selvage hot chicken authentic tumeric truffaut
            hexagon try-hard chambray.
          </p>
          <div className="flex justify-center">
            <button className="btn-primary">Button</button>
            <button className="btn-primary">Button</button>
          </div>
          {/* <a href={Firestore.resumepdf}>Resume</a>
        <button onClick={saveFile}>download</button> */}
        </div>
      </div>
    </div>
  );
};

export default skills;
