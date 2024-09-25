// src/app/admin.tsx
'use client'; // Ensure this component is a client component

import React, { useEffect } from 'react';
import AuthenticatedLayout from '../../AuthenticatedLayout'; // Adjust the import path as necessary
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

const AdminPage: React.FC = () => {
    const { user } = useAuth(); // Get user from AuthContext
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if user is not authenticated
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-screen bg-gray-100">
                {/* Content Area */}
                <div className="flex-1 p-6">
                    <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 shadow-md rounded-md">
                            <h3 className="text-lg font-semibold">Total Viewers</h3>
                            <p className="text-3xl font-bold">1,234</p>
                        </div>
                        <div className="bg-white p-4 shadow-md rounded-md">
                            <h3 className="text-lg font-semibold">Viewers per cart</h3>
                            <p className="text-3xl font-bold">4</p>
                        </div>
                        <div className="bg-white p-4 shadow-md rounded-md">
                            <h3 className="text-lg font-semibold">Active Viewers</h3>
                            <p className="text-3xl font-bold">567</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AdminPage;
