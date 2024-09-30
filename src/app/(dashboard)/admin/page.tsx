// src/app/admin.tsx
'use client'; // Ensure this component is a client component

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '../../AuthenticatedLayout'; // Adjust the import path as necessary
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import AWS from 'aws-sdk';

const AdminPage: React.FC = () => {
    const { user } = useAuth(); // Get user from AuthContext
    const router = useRouter();
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [newUsersToday, setNewUsersToday] = useState<number>(0);

    useEffect(() => {
        // Redirect to login if user is not authenticated
        if (!user) {
            router.push('/login');
        } else {
            fetchUserStatistics(); // Fetch user statistics when user is authenticated
        }
    }, [user, router]);
   
    const fetchUserStatistics = async () => {
        // Initialize AWS SDK with credentials from environment variables
        AWS.config.update({
            region: 'ap-northeast-1', // e.g., 'us-east-1'
            credentials: new AWS.Credentials({
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_ID || '',
                secretAccessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY || '',
            }),
        });
    
        const cognito = new AWS.CognitoIdentityServiceProvider();
    
        // Fetch total users
        try {
            const totalUsersData = await cognito.listUsers({
                UserPoolId: 'ap-northeast-1_BloHY92n3', // Your User Pool ID
                Limit: 60, // Adjust as necessary
            }).promise();
            setTotalUsers(totalUsersData.Users.length);
    
            // Filter new users today on the client-side
            const today = new Date();
            const startDate = today.setHours(0, 0, 0, 0); // Start of today
            const endDate = today.setHours(23, 59, 59, 999); // End of today
    
            const newUsersCount = totalUsersData.Users.filter(user => {
                const creationDate = new Date(user.UserCreateDate);
                return creationDate >= new Date(startDate) && creationDate <= new Date(endDate);
            }).length;
    
            setNewUsersToday(newUsersCount);
        } catch (error) {
            console.error('Error fetching total users:', error);
        }
    };
    

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-screen bg-gray-100">
                {/* Content Area */}
                <div className="flex-1 p-6">
                    <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 shadow-md rounded-md">
                            <h3 className="text-lg font-semibold">Total Users</h3>
                            <p className="text-3xl font-bold">{totalUsers}</p>
                        </div>
                        <div className="bg-white p-4 shadow-md rounded-md">
                            <h3 className="text-lg font-semibold">New Users Today</h3>
                            <p className="text-3xl font-bold">{newUsersToday}</p>
                        </div>
                        {/* <div className="bg-white p-4 shadow-md rounded-md">
                            <h3 className="text-lg font-semibold">Active Users</h3>
                            <p className="text-3xl font-bold">567</p>
                        </div> */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AdminPage;
