export interface IIndexLayout extends React.ComponentPropsWithoutRef<'div'> {}

const IndexLayout: React.FC<IIndexLayout> = ({ children }) => {
  return <div className="seembg">{children}</div>;
};

export default IndexLayout;
