'use client';
import React from 'react';
import Image from 'next/image';
import logoOnly from '@/public/surveylogo.svg';
import { useAuth } from './contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  // Generate user initials from first and last name
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'Guest';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="absolute top-0 left-0 w-full h-12 bg-[#2E2F32] z-0">
      <div className="absolute top-3 right-4 z-10 flex items-center space-x-2">
        {isAuthenticated && user ? (
          <>
            <p className="text-sm font-semibold text-white">{getDisplayName()}</p>
            <button 
              onClick={handleLogout}
              className="w-6 h-6 rounded-full bg-white text-[#2E2F32] flex items-center justify-center text-sm font-semibold hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
              title="Click to logout"
            >
              {getUserInitials()}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-white">Guest</p>
            <div className="w-6 h-6 rounded-full bg-white text-[#2E2F32] flex items-center justify-center text-sm font-semibold">
              G
            </div>
          </>
        )}
      </div>

      {/* Logo at top center for mobile */}
    <div className="md:hidden absolute  top-3 left-16 -translate-x-1/2 z-10">
      <Image src={logoOnly} alt="SurveyQuest Logo" className="w-28 h-auto" />
    </div>

      {/* Logo and text for desktop */}
      <div className="hidden md:flex absolute top-0 left-8 z-10 items-center gap-6 w-96">
        <Image src={logoOnly} alt="SurveyQuest Logo" className="w-40 h-auto" />
      </div>
    </div>
  );
};

export default Navbar;