"use client"
import { useState } from 'react';
import Image from 'next/image';

export default function Profile() {
  const [profileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    position: 'Software Developer',
    department: 'Engineering',
    phoneNumber: '+1 234 567 8900'
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        {/* Profile Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
          <p className="mt-1 text-sm text-gray-500">Personal details and information</p>
        </div>

        {/* Profile Content */}
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col items-center sm:items-start">
              <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden">
                <Image
                  src="https://via.placeholder.com/150" 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{profileData.name}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{profileData.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{profileData.position}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{profileData.department}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{profileData.phoneNumber}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}