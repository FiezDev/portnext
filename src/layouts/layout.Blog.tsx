export interface IBlogLayout extends React.ComponentPropsWithoutRef<'div'> {}

const BlogLayout: React.FC<IBlogLayout> = ({ children }) => {
  return <div>{children}</div>;
};

export default BlogLayout;
