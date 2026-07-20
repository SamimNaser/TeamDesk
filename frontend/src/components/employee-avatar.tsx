import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface EmployeeAvatarProps {
  name: string
}

export function EmployeeAvatar({ name }: EmployeeAvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Avatar className="size-9">
      <AvatarFallback className="text-xs font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
