import type { LayoutProps } from "../pageWithLayouts"
const BlogLayout: LayoutProps = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
}
export default BlogLayout