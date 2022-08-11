import WorkLayout from '@/src/components/layout.Work';
// import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Work: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <div>Work</div>
    </>
  );
};

export default Work;

Work.getLayout = (page) => {
  return <WorkLayout>{page}</WorkLayout>;
};
