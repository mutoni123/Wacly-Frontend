"use client"
import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    language: 'english',
    theme: 'light',
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        {/* Settings Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Settings</h3>
          <p className="mt-1 text-sm text-gray-500">Manage your preferences and account settings</p>
        </div>

        {/* Settings Content */}
        <div className="px-4 py-5 sm:p-6 space-y-6">
          {/* Notifications Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive email updates about your account</p>
                </div>
                <button 
                  className={`${settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'} 
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
                    transition-colors duration-200 ease-in-out`}
                  onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                >
                  <span className={`${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'} 
                    inline-block h-4 w-4 transform rounded-full bg-white transition 
                    duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive text messages for important updates</p>
                </div>
                <button 
                  className={`${settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'} 
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
                    transition-colors duration-200 ease-in-out`}
                  onClick={() => setSettings({...settings, smsNotifications: !settings.smsNotifications})}
                >
                  <span className={`${settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'} 
                    inline-block h-4 w-4 transform rounded-full bg-white transition 
                    duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Preferences</h4>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={settings.theme}
                  onChange={(e) => setSettings({...settings, theme: e.target.value})}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}