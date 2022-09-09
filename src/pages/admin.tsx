import AdminLayout from '@/layouts/layout.Admin';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { NextPageWithLayout } from '../pageWithLayouts';

const Admin: NextPageWithLayout = () => {
  return (
    <section>
      <HeaderAdmin />
      <main></main>
    </section>
  );
};

export default Admin;

Admin.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
