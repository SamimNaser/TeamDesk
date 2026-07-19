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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Department</TableHead>
              <TableHead className="font-bold">Position</TableHead>
              <TableHead className="font-bold">Joining Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee) => (
                <TableRow key={employee.id} className="">
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department ?? "—"}</TableCell>
                  <TableCell>{employee.position ?? "—"}</TableCell>
                  <TableCell>
                    {employee.joining_date
                      ? new Date(employee.joining_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
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
