import { Breadcrumbs } from '../components/admin/Breadcrumbs';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import Sidenav_admin from '../components/admin/Sidenav_admin';

export interface IAdminLayout extends React.ComponentPropsWithoutRef<'div'> {}

const AdminLayout: React.FC<IAdminLayout> = ({ children }) => {
  return (
    <>
      <div className="grid grid-cols-[200px_1fr] grid-rows-[80px_60px_1fr]">
        <div className="row-span-3 col-span-1 ">
          <Sidenav_admin />
        </div>
        <div className="row-span-1 col-span-1">
          <HeaderAdmin />
        </div>
        <div className="row-span-1 col-span-1">
          <Breadcrumbs />
        </div>
        <div className="row-span-1 col-span-1">{children}</div>
      </div>
    </>
  );
};

export default AdminLayout;
