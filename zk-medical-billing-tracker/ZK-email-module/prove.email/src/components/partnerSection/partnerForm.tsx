"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { childrenVariant, container } from "@/lib/motion";

const PartnerForm = () => {
  return (
<div className="flex flex-col items-center gap-3 mt-20 mb-20">
  <motion.h1 initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.5 }}
          className="lg:text-5xl text-4xl font-medium">Partner with Us</motion.h1>
    <motion.p
    initial="hidden"
    whileInView="visible"
    variants={{
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="w-4/5 text-muted-foreground font-normal text-center"
  >
    We're excited to hear from anyone!
  </motion.p>
  <motion.div className="bg-gradient-to-br from-blue-300 via-violet-300 to-orange-300 p-[1px] rounded w-fit mb-4"
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.5 }}>
  <Link
              href={"https://forms.gle/3SDkGcU3LnYHpepr7"}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "bg-tertiary dark:bg-tertiary-foreground text-tertiary-foreground font-normal dark:text-primary rounded hover:dark:bg-tertiary-foreground/80 w-[130px]"
              )}
            >
              Partner
            </Link>
  </motion.div>
</div>
  )
      }

export default PartnerForm;
