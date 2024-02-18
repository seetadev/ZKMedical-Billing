import React from "react";
import { TabsContent } from "../ui/tabs";
import TabContent from "../TabContent";
import Image from "next/image";
import { Input } from "../ui/input";

interface TabContent2Props {
  twitterInput: string;
  setTwitterInput: (value: string) => void;
}

const TabContent2 = ({ setTwitterInput, twitterInput }: TabContent2Props) => {
  return (
    <TabsContent value={"0"}>
      <TabContent
        title={"Proof of Twitter"}
        description={
          "Prove you own a Twitter username, via proving any email from Twitter."
        }
        href={"https://zkemail.xyz/"}
        button={"Mint Twitter Proof"}
        className="flex flex-col md:flex-row items-center max-lg:mt-10 max-md:text-center gap-x-20 gap-y-10"
      >
        <div className="flex flex-col gap-y-6 md:w-1/2 items-center">
          <Image src={"/twitter.svg"} alt={"twitter"} width={40} height={40} />
          <Input
            placeholder="Enter twitter username"
            name="twitter"
            value={twitterInput}
            onChange={(e) => setTwitterInput(e.target.value)}
            className="focus-visible:ring-0 w-2/3"
          />
        </div>
      </TabContent>
    </TabsContent>
  );
};

export default TabContent2;
