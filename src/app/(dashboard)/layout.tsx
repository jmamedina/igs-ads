import Link from "next/link";
import Image from "next/image";
import Menu from "../components/Menu";
import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-screen flex">

    {/* LEFT */}
    <div className="pt-3 w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%]">
      <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
        <div className="flex items-center gap-2 lg:pl-3 lg:pb-4 pb-4">
          <Image src="/igs.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block text-gray-700">IGS広告</span>
        </div>
      </Link>
      <Menu />
    </div>

    {/* RIGHT */}
    <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll">
      <Navbar />
      {children}
    </div>

  </div>;
}
