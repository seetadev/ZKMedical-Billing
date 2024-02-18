"use client";

import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MobileHeader from "./MobileHeader";
import { ModeToggle } from "./ModeToggle";
import SearchInput from "./SearchInput";
import MaxWidthWrapper from "./MaxWidthWrapper";

const routes = [
  {
    name: "Blog",
    pathname: "/blog",
  },
  {
    name: "Docs",
    pathname: "https://prove.email/docs.html",
  },
  {
    name: "Demos",
    pathname: "https://prove.email/#demos",
  },
  {
    name: "Contact",
    pathname: "https://t.me/zkemail",
  },
];

const Headers = () => {
  const pathname = usePathname();

  return (
    <MaxWidthWrapper>
      <div className="mt-4 flex items-center w-full justify-between sticky">
        <div className="flex items-center gap-12">
          <Logo />
          <nav className="gap-x-10 lg:flex hidden">
            {routes.map((route) => (
              <Link
                href={route.pathname}
                target={route.name === "Docs" ? "_blank" : "_self"}
                className={cn(
                  "hover:bg-0 hover:text-slate-500 transition-all",
                  pathname === route.pathname && "text-slate-500"
                )}
                key={route.pathname}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex gap-x-2">
          <SearchInput className="hidden md:flex" />
          <ModeToggle />
          <MobileHeader routes={routes} />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default Headers;
