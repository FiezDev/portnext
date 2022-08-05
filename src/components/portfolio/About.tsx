import React from 'react'
import guypic from "@/public/images/guy.jpg";
import Image from 'next/image';

type Props = {}

const about = (props: Props) => {
    return (
        <div className="text-gray-400 bg-gray-900 body-font lg:mx-[20vw] md:mx-[10vw] mx-[5vw]">
          <div className="lg:container mx-auto flex px-5 py-24 md:flex-row flex-col items-start">
     
              <div className="-z-1 lg:max-w-lg lg:w-full md:w-1/2 w-5/6 md:mb-0 mb-10">
                <Image
                  className="object-cover object-center"
                  alt="hero"
                  src={guypic}
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
                incidunt praesentium ab molestias facilis facere quis deserunt
                consequuntur quae nesciunt necessitatibus modi at animi, maxime rem
                error, ipsa expedita dolorem. Ut minima, labore veniam sit delectus
                error magni placeat minus enim praesentium! Nemo mollitia deleniti
                odio consectetur pariatur ipsa velit a ad praesentium, nostrum
                itaque iure sed fugiat tenetur ea, beatae necessitatibus quo tempora
                debitis officiis aperiam culpa quaerat delectus. Nisi magni
                similique nemo eum odit in, illum, iusto, asperiores ratione
                voluptatum ut ullam laborum ad corrupti temporibus nam cum enim
                accusantium saepe eius? Necessitatibus quasi harum, minus saepe,
                aliquid maiores ex recusandae eligendi facilis blanditiis quidem vel
                tenetur cupiditate amet dolores nesciunt delectus esse, nam nihil
                nemo? Consectetur quo id, repudiandae consequatur nesciunt et
                eveniet repellat dicta excepturi, aspernatur quam a ad magni! Sit
                aliquid ex debitis deleniti incidunt! Eos dignissimos iure at nisi
                dicta ipsam optio corporis quidem dolores omnis libero atque, autem
                consectetur. Esse, nesciunt alias cum minima repellat rerum! Tenetur
                a, quas, molestiae error aspernatur blanditiis laboriosam sint, quam
                similique rem incidunt quia placeat! Ipsa facilis cupiditate
                molestiae iure voluptatum repudiandae temporibus vel! Modi debitis
                delectus ad architecto dolor dignissimos incidunt repellendus
                laudantium velit repellat dolorem optio, commodi nulla in minima et
                odio! Quidem possimus temporibus exercitationem in aut fugit nulla
                dicta eaque deleniti nemo velit architecto perspiciatis harum
                accusantium incidunt et error dolores nostrum soluta maiores,
                ratione nesciunt! Enim iusto vitae repudiandae reiciendis autem
                veritatis voluptatem, sunt animi neque non nostrum, nesciunt numquam
                dignissimos. Et inventore sint ab possimus eius similique ullam? Eos
                architecto porro fugit debitis mollitia qui quibusdam quia pariatur
                illo cupiditate quasi nulla, voluptatibus quo tenetur! Pariatur,
                rem.
              </p>
              <div className="flex justify-center">
                <button className="btn-primary">Button</button>
                <button className="btn-primary">Button</button>
              </div>
            </div>
          </div>
        </div>
      );
}

export default about