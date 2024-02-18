import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

interface TabContentProps {
  children: React.ReactNode;
  title: string;
  description: string;
  href: string;
  button: string;
  className?: string;
}

const TabContent = ({
  button,
  children,
  description,
  href,
  title,
  className,
}: TabContentProps) => {
  return (
    <div className={cn(className)}>
      {children}

      <div className="flex flex-col gap-y-6 lg:w-1/2 max-md:items-center">
        <h1 className="font-semibold text-2xl">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="bg-gradient-to-br from-blue-300 via-violet-300 to-orange-300 rounded p-[1px] w-fit">
          <Link
            href={href}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "bg-tertiary dark:bg-tertiary-foreground text-tertiary-foreground font-normal dark:text-primary rounded hover:dark:bg-tertiary-foreground/80"
            )}
          >
            {button}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TabContent;
