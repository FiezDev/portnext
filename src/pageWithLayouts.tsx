import { NextPage } from "next"
import { ReactElement } from "react"
import MainLayout from "@/src/components/layoutIndex"
import PortfolioLayout from "@/src/components/layoutPortfolio"
import AdminLayout from "@/src/components/layoutAdmin"
import BlogLayout from "@/src/components/layoutBlog"
import WorkLayout from "@/src/components/layoutWork"

export type PageWithMainLayoutType = NextPage & { layout: typeof MainLayout }
export type PageWithPortfolioLayoutType = NextPage & { layout: typeof PortfolioLayout }
export type PageWithBlogLayoutType = NextPage & { layout: typeof BlogLayout }
export type PageWithWorkLayoutType = NextPage & { layout: typeof WorkLayout }
export type PageWithAdminLayoutType = NextPage & { layout: typeof AdminLayout }

export type PageWithLayoutType =
 | PageWithMainLayoutType
 | PageWithPortfolioLayoutType 
 | PageWithBlogLayoutType 
 | PageWithWorkLayoutType 
 | PageWithAdminLayoutType

export type LayoutProps = ({
 children,
}: {
 children: ReactElement
}) => ReactElement
export default PageWithLayoutType