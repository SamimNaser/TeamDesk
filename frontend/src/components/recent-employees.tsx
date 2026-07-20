import type { Employee } from "@/types/employee"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmployeeAvatar } from "@/components/employee-avatar"

interface RecentEmployeesProps {
  employees: Employee[]
}

export function RecentEmployees({ employees }: RecentEmployeesProps) {
  const recentEmployees = [...employees]
    .filter((employee) => employee.joining_date !== null)
    .sort(
      (a, b) =>
        new Date(b.joining_date!).getTime() -
        new Date(a.joining_date!).getTime()
    )
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Employees</CardTitle>
        <CardDescription>
          The most recently joined employees in the organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-6 font-medium">Employee</TableHead>
              <TableHead className="h-11 font-medium">Department</TableHead>
              <TableHead className="h-11 font-medium">Role</TableHead>
              <TableHead className="h-11 pr-6 text-right font-medium">
                Joined
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee) => (
                <TableRow key={employee.id} className="group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar name={employee.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{employee.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {employee.email} · ID {employee.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.department ? (
                      <Badge variant="secondary" className="font-normal">
                        {employee.department}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.position || "—"}
                  </TableCell>
                  <TableCell className="pr-6 text-right text-muted-foreground">
                    {employee.joining_date
                      ? new Date(employee.joining_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
