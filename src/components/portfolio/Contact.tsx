import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

import { codeuse, infouse, siteuse } from '@/model/mapdata';
import Heading from '../global/Heading';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const Contact: React.FC = () => {
  const [contact, setContact] = useState({
    name: '',
    email: '',
    message: '',
    reply: false,
    date: Date.now(),
  });
  const [notification, setNotification] = useState('');
  const [submit, setSubmit] = useState(false);
  const [captcha, setCaptcha] = useState('');
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
        setSubmit(true);
        setCaptcha(gReCaptchaToken);
      });
    },
    [executeRecaptcha]
  );

  useEffect(() => {
    if (submit && captcha) {
      fetch('/api/fireStoreSet', {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: contact,
          gRecaptchaToken: captcha,
          collections: 'Contacts',
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res, 'response from backend');
          if (res?.status === 'success') {
            setNotification(res?.message);
            setSubmit(false);
          } else {
            setNotification(res?.message);
            setSubmit(false);
          }
        });
    }
  }, [captcha, contact, submit]);

  return (
    <section className="container glass w-full flex flex-col xl:flex-row items-start justify-center mx-auto p-5 xl:pl-5 xl:pr-[3.75rem] py-10 gap-4 text-xl">
      <div className="p-10 rounded-3xl basis-full xl:basis-2/3 text-center w-full">
        <Heading className="pb-5" text={'Contact'} />
        <div className="text-left tracking-wide pb-3">
          Feel free to contact me for anything!!
        </div>
        <div className="text-left tracking-wide">
          Is there a job opportunity or a short-term project that you want to
          hire me? A desire for a collaborative project. Comment on my work, or
          even just say HI !!. I will reply to you ASAP.
        </div>
        <div className="flex flex-col md:flex-row h-full text-base md:text-xl uppercase text-left">
          <div className="basis-full xl:basis-1/2 text-left pt-10">
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
                <span className="flex flex-row flex-wrap items-center gap-4">
                  <div>
                    <span>Site Use</span>
                    <span className="pl-4">:</span>
                  </div>
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
          <div className="basis-full xl:basis-1/2 pt-10">
            <ul className="flex flex-col pl-[20%] normal-case gap-3">
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
      <div className="round-3xl basis-full w-full xl:basis-1/3 bg-bg shadow-md p-8 flex flex-col md md:ml-auto mt-10 md:mt-0 relative z-10">
        <form onSubmit={handleSumitForm}>
          <div className="relative mb-4">
            <label
              htmlFor="email"
              className="leading-7 text-base text-gray-400 font-bold"
            >
              Name*
            </label>
            <input
              required
              value={contact.name}
              onChange={(e) =>
                setContact((prevState) => ({
                  ...prevState,
                  name: e?.target?.value,
                }))
              }
              type="name"
              id="name"
              name="name"
              placeholder="Name"
              className="form-control w-full bg-light rounded border border-bg focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="glass relative mb-4">
            <label
              htmlFor="email"
              className="leading-7 text-base text-gray-400 font-bold"
            >
              Email*
            </label>
            <input
              required
              value={contact.email}
              onChange={(e) =>
                setContact((prevState) => ({
                  ...prevState,
                  email: e?.target?.value,
                }))
              }
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              className="form-control w-full bg-light rounded border border-bg focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="relative mb-4">
            <label
              htmlFor="message"
              className="leading-7 text-base text-gray-400 font-bold"
            >
              Message*
            </label>
            <textarea
              rows={3}
              required
              name="message"
              value={contact.message}
              onChange={(e) =>
                setContact((prevState) => ({
                  ...prevState,
                  message: e?.target?.value,
                }))
              }
              placeholder="Please Enter Message"
              className="form-control w-full bg-light rounded border border-bg focus:border-blue-500 focus:ring-2 focus:ring-blue-900 h-32 text-base outline-none text-black py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg"
          >
            Submit
          </button>
          {notification ? (
            <p className="pt-3 text-center text-sm">{notification}</p>
          ) : (
            <p className="pt-3 text-left text-red-700 text-sm">
              *** Please fill in all the required fields.
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
