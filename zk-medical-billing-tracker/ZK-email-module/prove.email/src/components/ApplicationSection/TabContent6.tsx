import { TabsContent } from "../ui/tabs";
import TabContent from "../TabContent";
import Image from "next/image";

const TabContent6 = () => {
  return (
    <TabsContent value={"5"}>
      <TabContent
        title={"Build your own?"}
        description={"Design via our open source, MIT licensed SDKs"}
        href={"https://www.npmjs.com/search?q=%40zk-email"}
        button={"Access SDK"}
        className="flex flex-col justify-center md:flex-row items-center gap-10 max-lg:mt-10 max-md:w-[90%] w-[450px]"
      >
        <div className="relative w-1/2 h-[60px]">
          <Image src={"/mit_license.svg"} alt="image" fill />
        </div>
      </TabContent>
    </TabsContent>
  );
};

export default TabContent6;
