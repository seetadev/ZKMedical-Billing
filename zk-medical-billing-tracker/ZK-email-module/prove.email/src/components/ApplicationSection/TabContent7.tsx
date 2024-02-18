import { TabsContent } from "../ui/tabs";
import TabContent from "../TabContent";
import Image from "next/image";
import { FaAirbnb } from "react-icons/fa";

const TabContent5 = () => {
  return (
    <TabsContent value={"4"}>
      <TabContent
        title={"Email 2FA: Gnosis Safe"}
        description={
          "Create a multisig to approve specific transactions via emails."
        }
        href={"https://ethglobal.com/showcase/zkemail-safe-z8dps"}
        button={"See Project"}
        className="flex flex-col justify-center max-md:text-center md:flex-row mx-auto items-center gap-10 max-lg:mt-10"
      >
        <div className="flex gap-5 w-1/2 items-center justify-center">
          {/* <div className="bg-red-500 flex items-center justify-center h-[59px] w-[59px] rounded-full">
            <FaAirbnb size={40} color={"white"} />
          </div> */}

          <div className="relative h-[150px] w-[300px]">
            <Image src={"/email_safe_compressed.png"} alt="image" fill />
          </div>
        </div>
      </TabContent>
    </TabsContent>
  );
};

export default TabContent5;
