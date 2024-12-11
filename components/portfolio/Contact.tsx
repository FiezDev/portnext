import ContactForm from '@/components/portfolio/contact/ContactForm';
import ContactInfo from '@/components/portfolio/contact/ContactInfo';

const Contact = () => (
  <section
    id="contact"
    className="container w-full flex flex-col xl:flex-row items-start justify-center mx-auto p-5 xl:px-[3.75rem] py-10 gap-4 text-xl"
  >
    <ContactInfo />
    <ContactForm />
  </section>
);

export default Contact;
