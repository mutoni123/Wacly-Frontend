// components/icons/LeaveIcons.tsx
import React from 'react';

export function VacationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zM16.5 6.5L14 9m-5.5-5l4 4"
      />
    </svg>
  );
}

export function SickIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

export function PersonalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975M11.25 3.75h.38a1.875 1.875 0 011.713 1.149l1.787 5.25a1.875 1.875 0 01-.462 2.006L14.5 13.5m-4.8 0h6m-6 3h6m4.275-6.75a23.76 23.76 0 00-3.225-3.066m0 0A23.907 23.907 0 0012 13.5a23.907 23.907 0 00-3.066-2.441M15.75 15.75a4.5 4.5 0 01-9 0 4.5 4.5 0 019 0z"
      />
    </svg>
  );
}