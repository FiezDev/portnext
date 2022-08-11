export interface IAdminLayout extends React.ComponentPropsWithoutRef<'div'> {}

const AdminLayout: React.FC<IAdminLayout> = ({ children }) => {
  return <div>{children}</div>;
};

export default AdminLayout;
