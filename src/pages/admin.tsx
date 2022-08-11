// import { useRouter } from 'next/router';
import AdminLayout from '../components/layout.Admin';
import { NextPageWithLayout } from '../pageWithLayouts';

type Props = {};

const Admin: NextPageWithLayout = (props: Props) => {
  // const { locale } = useRouter();

  return (
    <>
      <div>Admin</div>
    </>
  );
};

export default Admin;

Admin.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
