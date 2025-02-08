"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Documents = () => {
  const [documents] = useState([
    { 
      name: 'Employment Contract', 
      type: 'PDF', 
      uploadDate: '2023-12-01', 
      url: '/documents/employment-contract.pdf' 
    },
    { 
      name: 'Payroll Statement', 
      type: 'PDF', 
      uploadDate: '2024-01-15', 
      url: '/documents/payroll-statement.pdf' 
    },
    { 
      name: 'Performance Review', 
      type: 'DOCX', 
      uploadDate: '2023-11-15', 
      url: '/documents/performance-review.docx' 
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
        <Button variant="outline">Upload New Document</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Document Name</th>
                <th className="py-2 text-left">Type</th>
                <th className="py-2 text-left">Upload Date</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="py-2 flex items-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-6 h-6 text-blue-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                      />
                    </svg>
                    {doc.name}
                  </td>
                  <td className="py-2">{doc.type}</td>
                  <td className="py-2">{doc.uploadDate}</td>
                  <td className="py-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;