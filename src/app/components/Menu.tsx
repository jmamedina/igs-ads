import Link from 'next/link';
import React from 'react'
import Image from 'next/image';

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: "/home.png",
                label: "Home",
                href: "/admin",
            },
            {
                icon: "/upload.png",
                label: "Upload",
                href: "/upload",
            },
        ],
    },
    {
        title: "OTHER",
        items: [
            {
                icon: "/profile.png",
                label: "Profile",
                href: "/profile",
            },
            {
                icon: "/logout.png",
                label: "Logout",
                href: "/Logout",
            },
        ],
    },
];


const Menu = () => {
    return (
        <div className="">
            {menuItems.map(i => (
                <div className='flex flex-col gap-2' key={i.title}>
                    <span className="hidden lg:pl-3 lg:block text-gray-500 font-light my-4">{i.title}</span>
                    {i.items.map((item) => (
                        <Link href={item.href} key={item.label} className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 rounded-md md-px-2 hover:bg-lamaSkyLight">
                            <div className="w-2"></div>
                            <Image src={item.icon} alt="" width={20} height={20}/>
                            <span className="hidden lg:block">{item.label}</span>
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Menu