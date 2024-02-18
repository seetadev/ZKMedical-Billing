import React from "react";
import { TabsContent } from "../ui/tabs";
import TabContent from "../TabContent";
import Image from "next/image";

const TabContent1 = () => {
  return (
    <TabsContent
      value={"0"}
      className="flex flex-col lg:flex-row justify-center items-center"
    >
      <TabContent
        title={"Email Wallet"}
        description={
          "Email a relayer in order to transfer money or transact on Ethereum, anonymously."
        }
        href={"https://emailwallet.org/"}
        button={"Try Testnet Demo"}
        className="flex flex-col lg:flex-row gap-x-40 gap-y-10 relative items-center max-md:text-center"
      >
        <div className="relative w-[370px] lg:mr-10 lg:w-1/3 mt-[185px]">
          <Image
            src={"/mailOpen.svg"}
            alt="mail_open"
            width={40}
            height={40}
            className="absolute lg:left-16 left-2 bottom-2"
          />

          <div className="w-[180px] h-[180px] rounded-se-full lg:ml-16 lg:mt-2 absolute -rotate-[60deg] pt-[0.5px] left-[60px] bottom-0 bg-gradient-to-br from-blue-400 to-orange-400">
            <div className="bg-white dark:bg-slate-950 bg-transparent w-[180px] h-[180px] rounded-se-full absolute right-[0.5px]" />
          </div>

          <Image
            src={"/mailBox.svg"}
            alt="mail_box"
            width={40}
            height={40}
            className="lg:-right-[150px] absolute right-12 bottom-24"
          />
        </div>
      </TabContent>
    </TabsContent>
  );
};

export default TabContent1;
