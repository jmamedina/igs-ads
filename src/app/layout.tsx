// src/app/layout.tsx
'use client'
import React from 'react';
import { AuthProvider } from '../context/AuthContext'; // Adjust the path as necessary
import AuthenticatedLayout from './AuthenticatedLayout'; // Import your authenticated layout
import "../styles/globals.css";


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <html lang="en">
                <body>
                    <AuthenticatedLayout>{children}</AuthenticatedLayout>
                </body>
            </html>
        </AuthProvider>
    );
}
