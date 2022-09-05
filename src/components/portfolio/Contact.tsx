import { codeuse, infouse, siteuse } from '@/model/mapdata';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Heading from '../global/Heading';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSumitForm = useCallback(
    (e: any) => {
      e.preventDefault();
      if (!executeRecaptcha) {
        console.log('Execute recaptcha not yet available');
        return;
      }
      executeRecaptcha('enquiryFormSubmit').then((gReCaptchaToken) => {
        console.log(gReCaptchaToken, 'response Google reCaptcha server');
        submitEnquiryForm(gReCaptchaToken);
      });
    },
    [executeRecaptcha]
  );

  const submitEnquiryForm = (gReCaptchaToken: any) => {
    const dbname = Math.random().toString(36).substring(2, 12);

    fetch('/api/fireStoreSet', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        dbname: dbname,
        collections: 'Contact',
        gRecaptchaToken: gReCaptchaToken,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res, 'response from backend');
        if (res?.status === 'success') {
          setNotification(res?.message);
        } else {
          setNotification(res?.message);
        }
      });
  };

  return (
    <section className="container w-full flex flex-col xl:flex-row items-start justify-center mx-auto p-5 py-20 gap-4 text-xl">
      <div className="basis-full xl:basis-2/3 text-center w-full">
        <Heading className="pb-5" text={'Contact'} />
        <div className="text-left tracking-wide pb-3">
          Feel free to contact me for anything!!
        </div>
        <div className="text-left tracking-wide">
          Is there a job opportunity or a short-term project that you want to
          hire me?
          <br /> A desire for a collaborative project. Comment on my work, or
          even just say HI!!. <br /> I will reply to you ASAP.
        </div>
        <div className="flex flex-col md:flex-row h-full text-base md:text-xl uppercase text-left">
          <div className="basis-full xl:basis-1/2 text-left pt-20">
            <ul className="flex flex-col  gap-3">
              {codeuse.map(({ id, url, icon, text }) => {
                return (
                  <li key={id}>
                    <span>{text}</span>
                    <span className="px-4">:</span>
                    <a
                      className="w-[20px]"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon icon={icon} className="gap-4" />
                    </a>
                  </li>
                );
              })}
              <div>
                <span>Site Use</span>
                <span className="px-4">:</span>
                <span className="inline-flex items-center gap-4">
                  {siteuse.map(({ id, url, icon, width, height }) => {
                    return (
                      <a
                        key={id}
                        className="w-[20px]"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={icon}
                          width={width}
                          height={height}
                          alt=""
                        />
                      </a>
                    );
                  })}
                </span>
              </div>
              <span>Ittpol Vongapai Portfolio @ 2022</span>
            </ul>
          </div>
          <div className="basis-full xl:basis-1/2 pt-20">
            <ul className="flex flex-col normal-case gap-3">
              {infouse.map(({ id, icon, text, url }) => {
                return (
                  <li key={id}>
                    <FontAwesomeIcon icon={icon} />
                    <span className="px-4">:</span>
                    <a href={url}>{text}</a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <div className="glass basis-full w-full xl:basis-1/3 bg-bg shadow-md rounded-3xl p-8 flex flex-col md md:ml-auto mt-10 md:mt-0 relative z-10">
        <div className="relative mb-4">
          <label htmlFor="email" className="leading-7 text-sm text-gray-400">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e?.target?.value)}
            type="name"
            id="name"
            name="name"
            className="w-full bg-light rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <div className="relative mb-4">
          <label htmlFor="email" className="leading-7 text-sm text-gray-400">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e?.target?.value)}
            type="email"
            id="email"
            name="email"
            className="w-full bg-light rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <div className="relative mb-4">
          <label htmlFor="message" className="leading-7 text-sm text-gray-400">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e?.target?.value)}
            id="message"
            name="message"
            className="w-full bg-light rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 h-32 text-base outline-none text-gray-100 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
          ></textarea>
        </div>

        <button
          onSubmit={handleSumitForm}
          className="text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg"
        >
          Submit
        </button>
        {notification && <p>{notification}</p>}
      </div>
    </section>
  );
};

export default Contact;
