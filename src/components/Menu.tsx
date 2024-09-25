'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation'; // Updated import
import { useAuth } from '../context/AuthContext'; // Adjust the import path
import ConfirmationDialog from './ConfirmationDialog';

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: "/home.png",
                label: "トップ",
                href: "/admin",
            },
            {
                icon: "/upload.png",
                label: "アップロード",
                href: "/upload",
            },
            {
                icon: "/files.png",
                label: "動画",
                href: "/files",
            },
        ],
    },
    {
        title: "OTHER",
        items: [
            {
                icon: "/profile.png",
                label: "プロフィル",
                href: "/profile",
            },
            {
                icon: "/logout.png",
                label: "ログアウト",
                href: "/logout", // This can stay here but won't be used as a link
                isLogout: true, // Add a flag for logout item
            },
        ],
    },
];

const Menu = ({ cognitoUser }) => {
    const currentPath = usePathname(); // Updated hook
    const router = useRouter(); // Hook for navigation
    const { signOut } = useAuth(); // Get user from AuthContext
    const [ isDialogOpen, setIsDialogOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(cognitoUser);
            router.push('/'); 
        } catch (error) {
            console.error("Logout failed: ", error);
        }
    };

    return (
        <div className="">
            {menuItems.map(i => (
                <div className='flex flex-col gap-2' key={i.title}>
                    <span className="hidden lg:pl-3 lg:block text-gray-500 font-light">{i.title}</span>
                    {i.items.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                            item.isLogout ? ( // Check if it's the logout item
                                <button
                                    key={item.label}
                                    onClick={() => setIsDialogOpen(true)}
                                    className={`flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 md-px-2 hover:bg-lamaSkyLight`}
                                >
                                    <div className="lg:pl-4 flex items-center gap-4">
                                        <Image src={item.icon} alt="" width={20} height={20} />
                                        <span className="hidden lg:block">{item.label}</span>
                                    </div>
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    key={item.label}
                                    className={`flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 md-px-2 ${isActive ? 'bg-lamaSkyLight' : 'hover:bg-lamaSkyLight'}`}
                                >
                                    <div className="lg:pl-4 flex items-center gap-4">
                                        <Image src={item.icon} alt="" width={20} height={20} />
                                        <span className="hidden lg:block">{item.label}</span>
                                    </div>
                                </Link>
                            )
                        );
                    })}
                </div>
            ))}

            {/* confirmation dialog */}
            <ConfirmationDialog 
                isOpen={isDialogOpen}
                onCancel={() => setIsDialogOpen(false)}
                onConfirm={() => {
                    handleLogout();
                    setIsDialogOpen(false);
                }}
            />
        </div>
    );
}

export default Menu;
