import WorkLayout from '@/layouts/layout.Work';
import WUC from '../components/global/Wuc';
import { NextPageWithLayout } from '../pageWithLayouts';

const Work: NextPageWithLayout = () => {
  return <WUC linktext={''} backlink={''} />;
};

export default Work;

Work.getLayout = (page) => {
  return <WorkLayout>{page}</WorkLayout>;
};
