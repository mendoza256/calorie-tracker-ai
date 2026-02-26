"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, User, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import logo from "@/assets/calorie-tracker-logo.png";

export default function Nav() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    name?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 min-w-0">
            <div className="flex-none flex justify-start items-center">
              <Link
                href="/"
                className="flex-shrink-0 px-2 py-2"
                aria-label="Calorie Tracker AI home"
              >
                <Image
                  src={logo}
                  alt="Calorie Tracker AI"
                  className="h-8 w-[91px] min-w-[91px] object-contain object-left block"
                  width={91}
                  height={32}
                  priority
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2 min-w-0">
          <div className="flex-none flex justify-start items-center min-w-0">
            <Link
              href="/"
              className="flex-shrink-0 px-2 py-2 rounded-md"
              aria-label="Calorie Tracker AI home"
            >
              <Image
                src={logo}
                alt="Calorie Tracker AI"
                className="h-8 w-[91px] min-w-[91px] object-contain object-left block"
                width={91}
                height={32}
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 p-2 rounded-md text-sm font-medium"
            >
              Today
            </Link>
            <Link
              href="/history"
              className="text-gray-700 hover:text-gray-900 p-2 rounded-md"
              aria-label="History"
              title="History"
            >
              <Calendar className="w-5 h-5" />
            </Link>
            {user ? (
              <>
                <span
                  className="text-gray-700 p-2 rounded-md flex items-center"
                  title={user.name || user.email || "Profile"}
                  aria-label={user.name || user.email || "Profile"}
                >
                  <User className="w-5 h-5" />
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900 p-2 rounded-md"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
