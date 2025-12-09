import React from 'react';
import { ThemeColor } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  colorTheme?: ThemeColor;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  colorTheme = 'amber',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold tracking-wide transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const getPrimaryGradient = (theme: ThemeColor) => {
    switch (theme) {
      case 'emerald': return "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-400";
      case 'blue': return "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-400";
      case 'rose': return "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-200 hover:from-rose-600 hover:to-pink-700 focus:ring-rose-400";
      case 'violet': return "bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-200 hover:from-violet-600 hover:to-purple-700 focus:ring-violet-400";
      case 'slate': return "bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-300 hover:from-slate-800 hover:to-black focus:ring-slate-500";
      case 'amber':
      default: return "bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-200 hover:from-amber-500 hover:to-orange-600 focus:ring-orange-400";
    }
  };

  const variants = {
    primary: `${getPrimaryGradient(colorTheme as ThemeColor)} text-white shadow-lg hover:shadow-xl border border-transparent`,
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 shadow-sm",
    danger: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:from-rose-600 hover:to-pink-700 focus:ring-rose-400",
    success: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-500 hover:to-teal-600 focus:ring-emerald-400",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};