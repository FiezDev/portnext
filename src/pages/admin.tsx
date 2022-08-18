import AdminLayout from '@/layouts/layout.Admin';
import WUC from '../components/global/Wuc';
import { NextPageWithLayout } from '../pageWithLayouts';

const Admin: NextPageWithLayout = () => {
  return <WUC linktext={''} backlink={''} />;
};

export default Admin;

Admin.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
