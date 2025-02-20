"use client"

import { Department } from "@/types/department"
import { DataTable } from "../departments/table/data-table"
import { columns } from "../departments/table/columns"

interface DepartmentTableProps {
  departments: Department[]
  onView: (department: Department) => void
  onEdit: (department: Department) => void
  onDelete: (department: Department) => void
}

export function DepartmentTable({
  departments,
  onView,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  return (
    <DataTable
      columns={columns}
      data={departments}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}