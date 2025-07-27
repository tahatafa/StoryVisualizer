import React from 'react';
import { cn } from '../../lib/utils';

export const Button = ({ children, className, variant = 'default', size = 'default', ...props }) => {
    const variants = {
        default: 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 border-slate-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
        outline: 'border-slate-300 text-slate-700 hover:bg-slate-50',
        ghost: 'hover:bg-slate-100 text-slate-700'
    };
    
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        default: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };
    
    return (
        <button 
            className={cn(
                'inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )} 
            {...props}
        >
            {children}
        </button>
    );
};