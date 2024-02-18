import { TabsContent } from "../ui/tabs";
import TabContent from "../TabContent";
import Image from "next/image";
import { FaAirbnb } from "react-icons/fa";

const TabContent5 = () => {
  return (
    <TabsContent value={"3"}>
      <TabContent
        title={"ZK KYC"}
        description={
          "Prove you are a unique human, via combining known KYCs from Airbnb, Coinbase, etc."
        }
        href={"https://anonkyc.com/"}
        button={"Try Demo"}
        className="flex flex-col justify-center max-md:text-center md:flex-row mx-auto items-center gap-10 max-lg:mt-10"
      >
        <div className="flex gap-5 w-1/2 items-center justify-center">
          <div className="bg-red-500 flex items-center justify-center h-[59px] w-[59px] rounded-full">
            <FaAirbnb size={40} color={"white"} />
          </div>

          <div className="relative h-[60px] w-[60px]">
            <Image src={"/cLogo.svg"} alt="image" fill />
          </div>
        </div>
      </TabContent>
    </TabsContent>
  );
};

export default TabContent5;
