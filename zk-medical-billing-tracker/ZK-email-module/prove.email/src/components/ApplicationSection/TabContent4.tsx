import { TabsContent } from "../ui/tabs";
import TabContent from "../TabContent";
import Image from "next/image";

const TabContent4 = () => {
  return (
    <TabsContent value={"2"}>
      <TabContent
        title={"Proof of Organization"}
        description={
          "Prove you own an email address corresponding to some domain via ZK JWTs."
        }
        href={
          "https://www.loom.com/share/4a280711e0944cecbe680149cf4de02b?sid=d1247bf1-d78c-4295-81be-832f9ceaa8b8"
        }
        button={"Try on Nozee"}
        className="flex flex-col justify-center max-md:text-center md:flex-row mx-auto items-center gap-10 max-lg:mt-10"
      >
        <div className="relative w-1/2 h-[60px]">
          <Image src={"/notification_multiple.svg"} alt="image" fill />
        </div>
      </TabContent>
    </TabsContent>
  );
};

export default TabContent4;
