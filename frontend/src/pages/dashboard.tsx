import { useEffect, useState } from "react"
import { DashboardCards } from "@/components/dashboard-cards"
import { RecentEmployees } from "@/components/recent-employees"
import type { Employee } from "@/types/employee"

export function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    fetch("http://localhost:5001/employees")
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching employees:", error))
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          View an overview of your employees and organization.
        </p>
      </div>

      <DashboardCards employees={employees} />
      <RecentEmployees employees={employees} />
    </div>
  )
}
