"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { container, childrenVariant } from "@/lib/motion";
import TabContent1 from "./TabContent1";
import TabContent2 from "./TabContent2";
import TabContent3 from "./TabContent3";
import TabContent4 from "./TabContent4";
import TabContent5 from "./TabContent5";
import TabContent7 from "./TabContent7";

const datas = [
  // { name: "Email Wallet" },
  { name: "Proof of Twitter" },
  { name: "Proof of Github" },
  { name: "Proof of Domain" },
  { name: "ZK KYC" },
  { name: "Email 2FA Safe" },
];

const ApplicationSection = () => {
  const [twitterInput, setTwitterInput] = useState("");
  // bg-gradient-to-br dark:from-violet-950 dark:via-primary-foreground dark:to-emerald-950  from-violet-50 via-white to-emerald-50
  return (
    <>
    <motion.h1 className="text-4xl font-semibold text-center mt-16 md:mt-32">Community Applications</motion.h1>
    <section className="px-2.5 py-14 md:py-20 md:mt-8 mt-8 justify-center md:max-h-[650px] flex drop-shadow-lg md:mx-32 mx-2 border rounded-xl bg-white dark:bg-slate-950">
      <Tabs
        defaultValue="0"
        className="justify-center flex flex-col items-center"
      >
        <motion.div initial="hidden" whileInView="show" variants={container}>
          <TabsList className="flex flex-wrap gap-3 max-lg:bg-transparent mb-24 md:mb-10">
            {datas.map((data, index) => (
              <motion.div variants={childrenVariant} key={index}>
                <TabsTrigger
                  className="bg-muted max-lg:border max-md:shadow-md data-[state=active]:shadow hover:scale-105"
                  value={index.toString()}
                >
                  {data.name}
                </TabsTrigger>
              </motion.div>
            ))}
          </TabsList>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* <TabContent1 /> */}
          <TabContent2
            twitterInput={twitterInput}
            setTwitterInput={setTwitterInput}
          />
          <TabContent3 />
          <TabContent4 />
          <TabContent5 />
          <TabContent7 />
        </motion.div>
      </Tabs>
    </section>
    </>
  );
};

export default ApplicationSection;
