import { AppSidebar } from "@/components/app-sidebar"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { Dashboard } from "@/pages/dashboard"
import { AddEmployee } from "@/pages/add-employee"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  const location = useLocation()

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/employees": "All Employees",
    "/employees/add": "Add Employee",
    "/departments": "Departments",
  }

  const currentPage = pageTitles[location.pathname] ?? "Dashboard"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <Link
                    to="/"
                    className="transition-colors hover:text-foreground"
                  >
                    Employee Management
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees/add" element={<AddEmployee />} />
        </Routes>
      </SidebarInset>
      <Toaster position="bottom-center" />
    </SidebarProvider>
  )
}

export default App
