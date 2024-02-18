import Link from "next/link";
import MaxWidthWrapper from "../MaxWidthWrapper";
import { Zap } from "lucide-react";
import { Separator } from "../ui/separator";

const TechnologySection = () => {
  return (
    <MaxWidthWrapper className="flex flex-col lg:flex-row">
      <div className="flex flex-col gap-y-12">
        <div className="flex items-center gap-x-2">
          <Zap size={32} />
          <Separator className="w-1/3 bg-gradient-to-r from-blue-500 via-violet-500 to-orange-500" />
          <h1 className="text-4xl font-semibold">Technology</h1>
        </div>

        <p className="w-full md:w-1/2 text-muted-foreground mx-auto">
          We directly verify the signatures on your emails within a zk proof,
          including regex parsing within zk. Read our{" "}
          <Link
            href={"https://blog.aayushg.com/posts/zkemail/"}
            className="text-[#7e6cd6] hover:underline underline-offset-4"
            target="_blank"
          >
            blog post
          </Link>{" "}
          to understand the core email proving technology, or watch our
          <Link
            href={"https://www.youtube.com/watch?v=sPCHiUT3TmA&t=769s"}
            className="text-[#7e6cd6] hover:underline underline-offset-4"
            target="_blank"
          >
            technical presentation
          </Link>{" "}
          to understand how the email wallet technology works.
        </p>
      </div>
    </MaxWidthWrapper>
  );
};

export default TechnologySection;
