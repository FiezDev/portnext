import BlogLayout from '@/layouts/layout.Blog';
import WUC from '../components/global/Wuc';
import { NextPageWithLayout } from '../pageWithLayouts';

const Blog: NextPageWithLayout = () => {
  return <WUC linktext={''} backlink={''} />;
};

export default Blog;

Blog.getLayout = (page) => {
  return <BlogLayout>{page}</BlogLayout>;
};
