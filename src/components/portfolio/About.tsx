import { ImgixImage } from '@/model/storage';
import Image from 'next/image';
import React from 'react';

type Props = {};

export interface IAbout {}

const About: React.FC<IAbout> = (props: Props) => {
  return (
    <div className="text-gray-400 bg-bg">
      <div className="lg:mx-[20vw] md:mx-[10vw] mx-[5vw] flex px-5 py-24 md:flex-row flex-col items-start">
        <div className="-z-1 lg:max-w-lg lg:w-full md:w-1/2 w-5/6 md:mb-0 mb-10">
          <Image
            className="w-[50px] object-cover object-center rounded-full bg-black"
            src={ImgixImage.profilepic_faceme}
            width={700}
            height={846}
            alt="https://dummyimage.com/1000x1000"
          />
        </div>

        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">
            Before they sold out
            <br className="hidden lg:inline-block" />
            readymade gluten
          </h1>
          <p className="mb-8 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas
            placeat eum enim provident, asperiores impedit nihil dignissimos
            delectus amet, laborum esse libero sapiente sequi iusto minima
            magnam nobis rem? Enim mollitia repellendus omnis aut, corporis
            totam incidunt? Itaque praesentium temporibus minima nihil porro
            excepturi, id exercitationem quo ut molestiae error dignissimos vero
            adipisci eveniet illo natus commodi consectetur optio quas aperiam
            esse culpa beatae. Iste rem dolorum voluptas accusamus inventore
            tempora, veniam, quam provident quae nisi sapiente velit voluptate
            ipsum neque similique harum voluptatibus temporibus excepturi
            corporis commodi magnam, qui fugiat ab? Sequi, laudantium et a
            deserunt maxime sit rem, eum recusandae aut voluptates iste harum
            dolorem error iusto excepturi mollitia quas vero assumenda illum
            quaerat nam! Nihil deserunt dignissimos, dolor nobis amet explicabo
            dolorem quisquam at laboriosam nulla suscipit perferendis? Odit
            fugit assumenda tempora eveniet cum commodi neque mollitia, eligendi
            sed quia totam modi alias impedit fuga aspernatur corrupti!
            Suscipit, illo soluta? Esse ipsum unde accusamus adipisci eveniet
            fugiat eligendi, atque necessitatibus ducimus quo officia rerum
            cumque laudantium, facere optio odit velit non ipsam deleniti!
            Dolorem, voluptatibus est consequatur, quas quae ex doloremque
            pariatur praesentium neque repudiandae corporis beatae. Molestiae
            ullam cum mollitia vel consequatur, ex et expedita unde atque
            necessitatibus voluptatem asperiores nihil sed commodi sapiente quos
            possimus assumenda, est inventore consequuntur enim. Deleniti
            deserunt recusandae assumenda debitis optio ab impedit ipsum quis
            quidem! Obcaecati quos quod explicabo deleniti recusandae quidem
          </p>
          <div className="flex justify-center">
            <button className="btn-primary">Button</button>
            <button className="btn-primary">Button</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
