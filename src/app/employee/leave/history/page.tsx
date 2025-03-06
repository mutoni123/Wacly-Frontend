"use client";

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Download, Eye, RefreshCcw } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// Leave type mapping
const LEAVE_TYPES: { [key: number]: string } = {
    1: 'Annual Leave',
    2: 'Sick Leave',
    3: 'Parental Leave',
    // Add more leave types as needed
};

// Helper function for safe date formatting
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'dd MMM yyyy') : 'Invalid Date';
    } catch {
        return 'Invalid Date';
    }
};

// Helper function for status badge styling
const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'Approved':
            return 'bg-green-100 text-green-800';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'Rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Types
interface LeaveEntry {
    id: number;
    user_id: string;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    number_of_days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
    comments: string | null;
    action_by: string | null;
    action_at: string | null;
    created_at: string;
    updated_at: string;
}

export default function LeaveHistory() {
    const { toast } = useToast();
    const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const fetchLeaveHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast({
                    variant: "destructive",
                    title: "Authentication Error",
                    description: "Please login to view your leave history"
                });
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_BASE}/api/leave-requests/my-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Please login again to continue"
                });
                window.location.href = '/login';
                return;
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to fetch leave history');
            }

            setLeaveEntries(data.data);
        } catch (err) {
            console.error('Fetch error:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : 'Failed to load leave history'
            });
            setLeaveEntries([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    useEffect(() => {
      fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  const generatePDF = async () => {
      try {
          const element = document.getElementById('leave-history-table');
          if (!element) throw new Error('Table element not found');

          const canvas = await html2canvas(element);
          const imgData = canvas.toDataURL('image/png');

          const pdf = new jsPDF('l', 'mm', 'a4');
          
          // Add company header
          pdf.setFontSize(20);
          pdf.setTextColor(44, 62, 80);
          pdf.text('WACLY', 149, 15, { align: 'center' });
          
          pdf.setFontSize(16);
          pdf.text('Leave History Report', 149, 25, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 35);

          pdf.addImage(imgData, 'PNG', 10, 45, 277, 0);

          return pdf;
      } catch (error) {
          console.error('PDF generation error:', error);
          throw error;
      }
  };

  const previewPDF = async () => {
      try {
          setIsExporting(true);
          const pdf = await generatePDF();
          window.open(pdf.output('bloburl'), '_blank');
          toast({
              title: "Success",
              description: "PDF preview generated successfully",
              className: "bg-green-500 text-white",
          });
      } catch (err) {
          console.error('PDF preview error:', err);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to generate PDF preview"
          });
      } finally {
          setIsExporting(false);
      }
  };

  const downloadPDF = async () => {
      try {
          setIsExporting(true);
          const pdf = await generatePDF();
          pdf.save(`wacly-leave-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
          toast({
              title: "Success",
              description: "PDF downloaded successfully",
              className: "bg-green-500 text-white",
          });
      } catch (err) {
          console.error('PDF download error:', err);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to download PDF"
          });
      } finally {
          setIsExporting(false);
      }
  };

  return (
      <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h1 className="text-2xl font-bold text-gray-800">Leave History</h1>
                  <p className="text-sm text-gray-500 mt-1">
                      View and export your leave records
                  </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                  <Button
                      variant="outline"
                      onClick={fetchLeaveHistory}
                      disabled={isLoading}
                      className="flex-1 md:flex-none"
                  >
                      {isLoading ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Refreshing...
                          </>
                      ) : (
                          <>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Refresh
                          </>
                      )}
                  </Button>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button 
                              disabled={isExporting || leaveEntries.length === 0}
                              className="flex-1 md:flex-none"
                          >
                              {isExporting ? (
                                  <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Exporting...
                                  </>
                              ) : (
                                  <>
                                      <FileText className="mr-2 h-4 w-4" />
                                      Export
                                  </>
                              )}
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                          <DropdownMenuItem onClick={previewPDF}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={downloadPDF}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>Past Leave Applications</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="overflow-x-auto -mx-6" id="leave-history-table">
                      <table className="w-full">
                          <thead>
                              <tr className="border-b">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action By</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {isLoading ? (
                                  <tr>
                                      <td colSpan={8} className="text-center py-4">
                                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                      </td>
                                  </tr>
                              ) : leaveEntries.length === 0 ? (
                                  <tr>
                                      <td colSpan={8} className="text-center py-4 text-gray-500">
                                          No leave history found
                                      </td>
                                  </tr>
                              ) : (
                                  leaveEntries.map((entry) => (
                                      <tr key={entry.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                              {formatDate(entry.created_at)}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                              {LEAVE_TYPES[entry.leave_type_id] || `Type ${entry.leave_type_id}`}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                              <div>
                                                  <div>From: {formatDate(entry.start_date)}</div>
                                                  <div>To: {formatDate(entry.end_date)}</div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                              {entry.number_of_days}
                                          </td>
                                          <td className="px-6 py-4 text-sm">
                                              <div className="max-w-xs overflow-hidden text-ellipsis">
                                                  {entry.reason}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`
                                                  px-2 py-1 text-xs rounded-full
                                                  ${getStatusBadgeClass(entry.status)}
                                              `}>
                                                  {entry.status}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-sm">
                                              <div className="max-w-xs overflow-hidden text-ellipsis">
                                                  {entry.comments || 'No comments'}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                              {entry.action_by ? (
                                                  <div>
                                                      <div>{entry.action_by}</div>
                                                      <div className="text-xs text-gray-500">
                                                          {formatDate(entry.action_at)}
                                                      </div>
                                                  </div>
                                              ) : (
                                                  <span className="text-gray-400">Pending</span>
                                              )}
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </CardContent>
          </Card>
      </div>
  );
}