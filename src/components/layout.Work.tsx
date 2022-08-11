export interface IWorkLayout extends React.ComponentPropsWithoutRef<'div'> {}

const WorkLayout: React.FC<IWorkLayout> = ({ children }) => {
  return <div>{children}</div>;
};

export default WorkLayout;
