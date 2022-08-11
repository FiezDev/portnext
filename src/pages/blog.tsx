import BlogLayout from '@/src/components/layout.Blog';
// import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Blog: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <div>Blog</div>
    </>
  );
};

export default Blog;

Blog.getLayout = (page) => {
  return <BlogLayout>{page}</BlogLayout>;
};
