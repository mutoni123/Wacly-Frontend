// app/manager/leave/requests/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestTable from "@/components/manager/leave/LeaveRequestsTable";
import ApplyLeave from "@/components/manager/leave/ApplyLeave";
import LeaveReports from "@/components/manager/leave/LeaveReports";


export default function ManagerLeavePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'reports'

  return (
    <div className="container max-w-7xl p-6 space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
        <div className="flex items-center gap-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="requests" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests Table */}
          <Card>
            <CardContent className="p-0">
              <LeaveRequestTable
                searchTerm={searchTerm}
                statusFilter={statusFilter}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <LeaveReports />
        </TabsContent>
      </Tabs>

      {/* New Leave Request Modal */}
      <Dialog 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <ApplyLeave 
            onComplete={() => {
              setIsModalOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}