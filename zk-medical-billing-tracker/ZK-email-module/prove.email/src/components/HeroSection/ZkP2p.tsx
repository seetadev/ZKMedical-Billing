import { IoLogoVenmo } from "react-icons/io5";
import GradientButton from "../GradientButton";
import DollarGradientIcon from "../DollarGradientIcon";
import Image from "next/image";
import { motion } from "framer-motion";

const Zkp2p = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView={"visible"}
      transition={{ duration: 0.5, delay: 0.4 }}
      variants={{
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
      }}
      className="flex flex-col gap-4 relative pt-20 lg:w-[570px]"
    >
      <div className="flex justify-center">
        <div className="flex flex-row items-center gap-2">
          <Image
            src={"/ethereum-gold.svg"}
            alt="ethereum-gold"
            width={50}
            height={50}
          />
          {/* <div className="mt-2"> */}
            <IoLogoVenmo size={60} color="#3496cd" />
          {/* </div> */}
        </div>

        <DollarGradientIcon className="absolute right-[33%] lg:right-52 rotate-12 top-14" />
        <DollarGradientIcon className="absolute left-[33%] lg:left-52 -rotate-12 top-16" />
        <DollarGradientIcon className="absolute right-[18%] lg:right-32 rotate-[60deg] top-36" />
        <DollarGradientIcon className="absolute left-[18%] lg:left-36 rotate-[60deg] top-36" />
      </div>

      <div className="flex flex-col gap-8 items-center pt-6">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-lg font-semibold">ZK P2P</h1>
          <p className="lg:w-4/5 w-full text-muted-foreground">
            Peer to peer marketplace for decentralized on ramp/offramp to
            ethereum via Venmo and other payment services.
          </p>
        </div>

        <GradientButton href="https://zkp2p.xyz/" buttonStyle="w-fit">
          Try on Mainnet L2
        </GradientButton>
      </div>
    </motion.div>
  );
};

export default Zkp2p;
