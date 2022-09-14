import AdminLayout from '@/src/layouts/layout.Admin';
import { NextPageWithLayout } from '@/src/pageWithLayouts';
import Head from 'next/head';

type Props = {};

const chat: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>Chat ManageMent</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <section className="flex flex-col h-full text-5xl gap-4 bg-light">
        <div className="bg-head">dava</div>
      </section>
    </>
  );
};

export default chat;

chat.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
