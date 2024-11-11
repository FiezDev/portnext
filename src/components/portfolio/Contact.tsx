import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

import { codeuse, infouse, siteuse } from '@/model/mapdata';
import Heading from '../global/Heading';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '@material-tailwind/react';
import axios from 'axios';
import { DebounceInput } from 'react-debounce-input';
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
  const [showNoti, setShowNoti] = useState(false);
  const [notiStat, setNotiStat] = useState('green');
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

  const handlenotification = (noti: string, status: string) => {
    setNotiStat(status);
    setNotification(noti);
    setShowNoti(true);
    setTimeout(() => {
      setShowNoti(false);
    }, 3000);
  };

  useEffect(() => {
    setShowNoti(false);
  }, [contact.name, contact.email, contact.message]);

  useEffect(() => {
    if (submit && captcha) {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKURL}api/fireStoreSet`,
          {
            data: contact,
            gRecaptchaToken: captcha,
            collections: process.env.NEXT_PUBLIC_FIRESTORE_CONTACT,
          },
          {
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
            },
          }
        )
        .then((response) => {
          if (response?.data.status === 'success') {
            handlenotification(response?.data.message, response?.data.status);
            setSubmit(false);
          } else {
            handlenotification(response?.data.message, response?.data.status);
            setSubmit(false);
          }
        })
        .catch((error) => console.log(error));
    }
  }, [captcha, contact, submit]);

  return (
    <section
      id="contact"
      className="container w-full flex flex-col xl:flex-row items-start justify-center mx-auto p-5 xl:pl-5 xl:pr-[3.75rem] py-10 gap-4 text-xl"
    >
      <section className="p-10 rounded-3xl basis-full xl:basis-2/3 text-center w-full">
        <Heading className="pb-5" text={'Contact'} />
        <p className="text-left tracking-wide">
          If you&apos;re interested in hiring me for a job or a short-term
          project, looking for a collaboration, or simply want to share your
          thoughts on my work, feel free to reach out. I&apos;ll get back to you
          as promptly as I can.
        </p>
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
              <span>FiezDev Portfolio @ 2022 - 2024</span>
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
      </section>
      <div className="rounded-3xl basis-full w-full xl:basis-1/3 bg-bg shadow-md p-8 flex flex-col md md:ml-auto mt-10 md:mt-0 relative z-10">
        <form onSubmit={handleSumitForm}>
          <div className="relative mb-4">
            <label
              htmlFor="name"
              className="leading-7 text-base text-gray-400 font-bold"
            >
              Name*
            </label>
            <DebounceInput
              required
              element="input"
              debounceTimeout={300}
              value={contact.name}
              onChange={(e) =>
                setContact((prevState) => ({
                  ...prevState,
                  name: e?.target?.value,
                }))
              }
              type="name"
              id="name" // Make sure this matches the "for" attribute in the label
              name="name"
              placeholder="Name"
              className="form-control w-full bg-light rounded border border-bg focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-black py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="glass relative mb-4">
            <label
              htmlFor="email"
              className="leading-7 text-base text-gray-400 font-bold"
            >
              Email*
            </label>
            <DebounceInput
              required
              element="input"
              debounceTimeout={300}
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
              className="form-control w-full bg-light rounded border border-bg focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-black py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="relative mb-4">
            <label
              htmlFor="content"
              className="leading-7 text-base text-gray-400 font-bold"
            >
              Message*
            </label>

            <DebounceInput
              rows={3}
              required
              element="textarea"
              debounceTimeout={300}
              name="content"
              value={contact.message}
              onChange={(e) =>
                setContact((prevState) => ({
                  ...prevState,
                  message: e?.target?.value,
                }))
              }
              placeholder="Please Enter Message"
              className="form-control w-full bg-light rounded border border-bg focus:border-blue-500 focus:ring-2 focus:ring-blue-900 h-32 text-base outline-none text-black py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
            />
          </div>

          <button
            type="submit"
            className="w-full text-white bg-head border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg"
          >
            Submit
          </button>
          {showNoti ? (
            <div className="flex items-center justify-center h-[30px] pt-[30px] my-2">
              <Alert
                className="animate-[sloshow_3s_ease-in-out] text-sm"
                color={notiStat === 'success' ? 'green' : 'red'}
              >
                {notification}
              </Alert>
            </div>
          ) : (
            <div className="flex items-center h-[30px] pt-[30px] my-2">
              <p className="text-red-700 text-sm">
                *** Please fill in all the required fields.
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
