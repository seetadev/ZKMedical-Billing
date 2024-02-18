import { cn } from "@/lib/utils";
import Image from "next/image";

const DollarGradientIcon = ({ className }: { className?: string }) => {
  return (
    <Image
      src={"/paid.svg"}
      alt="paid"
      width={20}
      height={20}
      className={cn("rotate-[30deg]", className)}
    />
  );
};

export default DollarGradientIcon;
