import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  button: string;
  href: string;
}

const ApplicationCard = ({
  children,
  button,
  description,
  href,
  title,
}: ApplicationCardProps) => {
  return (
    <Card>
      <CardHeader className="w-full relative h-40 bg-transparent">
        <Image src={"/appcard-bg.svg"} alt="card background image" fill />
        {children}
      </CardHeader>
      <div className="flex flex-col h-[180px]">
        <CardContent className="gap-y-2 flex flex-col p-2 pt-4">
          <h1 className="font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter className="mt-auto p-2">
          <div className="bg-gradient-to-br from-blue-300 via-violet-300 to-orange-300 rounded p-[1px]">
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
        </CardFooter>
      </div>
    </Card>
  );
};

export default ApplicationCard;
