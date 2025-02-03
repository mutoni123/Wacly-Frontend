import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, TrendingUp } from 'lucide-react';

export default function DepartmentsPage() {
  const departments = [
    {
      id: 1,
      name: "Engineering",
      employeeCount: 45,
      head: "Jane Smith",
      growth: "+5.2%",
      budget: "$500,000",
      projects: 12
    },
    {
      id: 2,
      name: "Marketing",
      employeeCount: 28,
      head: "Mike Johnson",
      growth: "+3.8%",
      budget: "$300,000",
      projects: 8
    },
    // Add more departments as needed
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{dept.name}</span>
                <Button variant="outline" size="sm">Manage</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Employees</span>
                </div>
                <span className="font-medium">{dept.employeeCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Head</span>
                <span className="font-medium">{dept.head}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Growth</span>
                </div>
                <span className="text-green-600 font-medium">{dept.growth}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Budget</div>
                  <div className="font-medium">{dept.budget}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                  <div className="font-medium">{dept.projects}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}