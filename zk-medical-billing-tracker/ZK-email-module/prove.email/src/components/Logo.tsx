import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href={"/"} className="flex items-center gap-2">
      <Image src={"https://i.imgur.com/46VRTCF.png"} alt="logo" width={60} height={50} />
      <span className="uppercase font-semibold text-lg">zk email</span>
    </Link>
  );
};

export default Logo;
