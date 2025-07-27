import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, ...props }) => (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-lg backdrop-blur-sm', className)} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ children, className, ...props }) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
        {children}
    </div>
);

export const CardContent = ({ children, className, ...props }) => (
    <div className={cn('p-6 pt-0', className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ children, className, ...props }) => (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
        {children}
    </h3>
);