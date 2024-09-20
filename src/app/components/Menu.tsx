'use client'

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Updated import

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
                href: "/Logout",
            },
        ],
    },
];

const Menu = () => {
    const currentPath = usePathname(); // Updated hook

    return (
        <div className="">
            {menuItems.map(i => (
                <div className='flex flex-col gap-2' key={i.title}>
                    <span className="hidden lg:pl-3 lg:block text-gray-500 font-light">{i.title}</span>
                    {i.items.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                            <Link
                                href={item.href}
                                key={item.label}
                                className={`flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 md-px-2 ${isActive ? 'bg-lamaSkyLight ' : 'hover:bg-lamaSkyLight'}`}
                            >
                                <div className="lg:pl-4 flex items-center gap-4">
                                    <Image src={item.icon} alt="" width={20} height={20} />
                                    <span className="hidden lg:block">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ))}
        </div>
    )
}

export default Menu;
