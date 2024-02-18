import Image from "next/image";
import { Separator } from "../ui/separator";
import GradientButton from "../GradientButton";
import { motion } from "framer-motion";

const EmailWallet = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView={"visible"}
      transition={{ duration: 0.5, delay: 0.4 }}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
      }}
      className="flex flex-col gap-4 pt-20 lg:w-[570px]"
    >
      <div className="flex gap-x-2 items-center justify-center">
        <Image src={"/mailOpen.svg"} alt={"mail_open"} width={60} height={60} />
        <div className="flex items-center">
          <Separator className="w-16 dark:bg-white/40 bg-slate-300" />
          <Image
            src={"/local_atm.svg"}
            alt="local_atm"
            width={60}
            height={60}
          />
          <Separator className="w-16 dark:bg-white/40 bg-slate-300" />
        </div>
        <Image src={"/mailOpen.svg"} alt={"mail_open"} width={60} height={60} />
      </div>

      <div className="flex flex-col gap-8 items-center pt-6 mt-auto">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-lg font-semibold">Email Wallet</h1>
          <p className="lg:w-4/5 w-full text-muted-foreground">
            Email a relayer in order to transfer money or transact on Ethereum,
            anonymously.
          </p>
        </div>

        <GradientButton href="https://sendeth.org/" buttonStyle="w-fit">
          Try Testnet Demo
        </GradientButton>
      </div>
    </motion.div>
  );
};

export default EmailWallet;
