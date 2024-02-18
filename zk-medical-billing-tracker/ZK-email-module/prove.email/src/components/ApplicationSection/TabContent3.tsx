import { FaGithub } from "react-icons/fa";
import { TabsContent } from "../ui/tabs";
import TabContent from "../TabContent";

const TabContent3 = () => {
  return (
    <TabsContent value={"1"}>
      <TabContent
        title={"ZK Proof of Github"}
        description={
          "Prove you committed to a Github repo via proving emails of contribution invitation."
        }
        href={
          "https://www.loom.com/share/4a280711e0944cecbe680149cf4de02b?sid=d1247bf1-d78c-4295-81be-832f9ceaa8b8"
        }
        button={"Watch Demo"}
        className="flex flex-col justify-center md:flex-row max-md:text-center mx-auto items-center max-lg:mt-10 gap-10"
      >
        <FaGithub size={60} color={"#8C6FE2"} className='w-1/2' />
      </TabContent>
    </TabsContent>
  );
};

export default TabContent3;
