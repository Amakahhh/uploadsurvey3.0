'use client';
import React from 'react';
import { useAuth } from './contexts/AuthContext';

export default function TopNavbar() {
  const { logout, isAuthenticated, user } = useAuth();

  // Generate user initials from first and last name
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'Guest User';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  return (
    <div className="relative w-full bg-[#2E2F32] text-white flex justify-between items-center px-6 py-3">
      <div className="absolute left-20 -translate-x-1/2 top-full -mt-12 z-10">
        <img src="/SurveyHustler Logo.png" alt="SurveyHustler Logo" className="h-28 rounded-full p-2" />
      </div>
      <div className="w-20" />
      <div className="flex items-center gap-4 ml-auto">
        {isAuthenticated && (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors duration-200"
          >
            Logout
          </button>
        )}
        <button 
          onClick={logout}
          className="w-10 h-10 rounded-full bg-[#B3935E] hover:bg-[#A0824F] flex items-center justify-center text-lg font-semibold transition-colors duration-200 cursor-pointer"
          title={isAuthenticated ? "Click to logout" : "Guest User"}
        >
          {getUserInitials()}
        </button>
        <span className="text-sm font-medium">{getDisplayName()}</span>
      </div>
    </div>
  );
}