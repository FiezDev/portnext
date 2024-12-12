import { ImgixImage } from '@/constants/storage';
import { chatroom } from '@/types/object';
import { faClose, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';

interface LiveChatProps {
  linktext: string;
  backlink: string;
};

const LiveChat = () => {
  const [showChat, setShowChat] = useState(false);
  const [chatData, setChatData] = useState<chatroom>();
  const [text, setText] = useState('');
  const textboxRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {!showChat ? (
        <section className="fixed right-[5px] bottom-[calc(0px+90px)]">
          <Image
            src={ImgixImage.main_chat}
            alt=""
            width={65}
            height={65}
            onClick={() => setShowChat(true)}
          />
        </section>
      ) : (
        <section className="fixed right-0 bottom-[calc(0px+90px)] z-30">
          <main className="glass w-[350px] h-[500px] rounded-bl-2xl rounded-tl-2xl text-white flex flex-col p-4 pt-0 border-2 border-r-0 ">
            <section className="flex flex-row mb-2">
              <header className="w-full pt-4 pb-2 border-b-2">
                Live Chat - Admin@fiez.dev
              </header>
              <FontAwesomeIcon
                className="w-[20px] h-[20px] pb-2 mr-4"
                onClick={() => setShowChat(false)}
                icon={faWindowMinimize}
              />
              <FontAwesomeIcon
                className="w-[20px] h-[20px] mt-2 mr-2"
                onClick={() => setShowChat(false)}
                icon={faClose}
              />
            </section>

            <section className="flex flex-col grow overflow-y-auto">
              <p className="flex flex-col items-start p-2 gap-2">
                <h1>You :</h1>
                <div className="flex flex-row">
                  <span className="p-1 rounded bg-normal text-white">
                    test text
                  </span>
                  <time className="pl-3 flex items-end text-xs text-white bg-transparent">
                    11.24
                  </time>
                </div>
                <div className="flex flex-row">
                  <span className="p-1 rounded bg-normal text-white">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Perspiciatis inventore placeat unde magni laudantium quod
                    vitae aliquam ipsa eaque, id temporibus voluptas consectetur
                    delectus voluptatem? Minus, optio culpa excepturi aspernatur
                    molestias assumenda. Asperiores saepe rerum maxime laborum
                    mollitia et fugit quos, suscipit, magni distinctio deleniti
                    debitis! Expedita aperiam laudantium corporis.
                  </span>
                  <time className="pl-3 flex items-end text-xs text-white bg-transparent">
                    11.24
                  </time>
                </div>
              </p>
              <p className="flex flex-col items-end p-2 gap-2">
                <h1>Admin@Fiez.dev :</h1>
                <div className="flex flex-row">
                  <time className="pr-3 flex items-end text-xs text-white bg-transparent">
                    11.24
                  </time>
                  <span className="p-1 rounded bg-head text-white">
                    test text
                  </span>
                </div>
                <div className="flex flex-row ">
                  <time className="pr-3 flex items-end text-xs  text-white bg-transparent">
                    11.24
                  </time>
                  <span className="p-1 rounded bg-head text-white">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Perspiciatis inventore placeat unde magni laudantium quod
                    vitae aliquam ipsa eaque, id temporibus voluptas consectetur
                    delectus voluptatem? Minus, optio culpa excepturi aspernatur
                    molestias assumenda. Asperiores saepe rerum maxime laborum
                    mollitia et fugit quos, suscipit, magni distinctio deleniti
                    debitis! Expedita aperiam laudantium corporis.
                  </span>
                </div>
              </p>
            </section>
            <section className="flex flex-row mt-2 gap-3">
              <DebounceInput
                element="textarea"
                debounceTimeout={300}
                name="message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Please Enter Message"
                className="form-control w-full h-[45px] rounded text-base text-black bg-light resize-none p-2 focus:border-blue-500 focus:ring-2"
              />
              <Image
                className="w-[30px] h-[30px]"
                src={ImgixImage.main_send}
                alt=""
                width={30}
                height={30}
                onClick={() => setShowChat(true)}
              />
            </section>
          </main>
        </section>
      )}
    </>
  );
};

export default LiveChat;