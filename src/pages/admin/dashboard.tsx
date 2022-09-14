import AdminLayout from '@/layouts/layout.Admin';
import { NextPageWithLayout } from '../../pageWithLayouts';

const dashbord: NextPageWithLayout = () => {
  return <section></section>;
};

export default dashbord;

dashbord.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
