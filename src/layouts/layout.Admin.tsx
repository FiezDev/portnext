export interface IAdminLayout extends React.ComponentPropsWithoutRef<'div'> {}

const AdminLayout: React.FC<IAdminLayout> = ({ children }) => {
  return <div className="bg-white">{children}</div>;
};

export default AdminLayout;
