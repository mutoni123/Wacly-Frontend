'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios'; // Import axios

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: formData.email,
        password: formData.password,
      });

      // Save JWT token to localStorage if login is successful
      localStorage.setItem('token', response.data.token);

      // Handle successful login and redirect based on role
      const userRole = response.data.role;

      // Redirect user based on their role
      if (userRole === 'admin') {
        window.location.href = '/admin';  // Redirect to admin dashboard
      } else if (userRole === 'manager') {
        window.location.href = '/manager';  // Redirect to manager dashboard
      } else if (userRole === 'employee') {
        window.location.href = '/employee';  // Redirect to employee dashboard
      } else {
        alert('Unknown role, please contact support.');
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error('Login error', error);
      setIsLoading(false);
      // Handle login error (show error message to the user)
      alert('Invalid login credentials');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-600 to-pink-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg w-full max-w-md rounded-2xl p-8 shadow-xl"
      >
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            width={60}
            height={60}
            alt="Wacly-hrms Logo"
            className="rounded-xl mb-4"
          />
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-white/80 mt-2">Sign in to continue to Wacly-hrms</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg 
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg 
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-purple-500 
                         focus:ring-purple-500 focus:ring-offset-0"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-white">
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-white hover:text-purple-200 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold
                     hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 
                     focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-purple-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </motion.button>

          {/* Sign Up Link */}
          <p className="text-center text-white">
            Dont have an account?{' '}
            <Link href="/signup" className="font-medium hover:text-purple-200 transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
