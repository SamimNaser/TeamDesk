import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Employee } from "@/types/employee"

interface DashboardCardsProps {
  employees: Employee[]
}

export function DashboardCards({ employees }: DashboardCardsProps) {
  const totalEmployees = employees.length

  const totalDepartments = new Set(
    employees
      .map((employee) => employee.department)
      .filter((department) => department !== null)
  ).size

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentJoiners = employees.filter((employee) => {
    if (!employee.joining_date) return false
    return new Date(employee.joining_date) >= thirtyDaysAgo
  }).length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Total Employees</CardDescription>
          <CardTitle className="text-3xl">{totalEmployees}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Employees currently registered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Total Departments</CardDescription>
          <CardTitle className="text-3xl">{totalDepartments}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Departments across the organization
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Recent Joiners</CardDescription>
          <CardTitle className="text-3xl">{recentJoiners}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Employees who joined in the last 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
