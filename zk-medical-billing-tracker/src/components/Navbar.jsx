import { IonIcon } from "@ionic/react";
import { useLocation } from "react-router";
import {
  journal,
  documents,
  calendar,
  settings,
  logIn,
  logOut,
} from "ionicons/icons";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";
import { Avatar, Button } from "@nextui-org/react";
import { signOut } from "../Firebase/auth";

const links = [
  { icon: journal, title: "Dashboard", path: "/" },
  { icon: documents, title: "Invoices", path: "/invoices" },
  { icon: calendar, title: "Calendar", path: "/calendar" },
  { icon: settings, title: "Settings", path: "/settings" },
];

const CustomLinkComponent = ({ link }) => {
  const location = useLocation();
  const activeClasses = "bg-[#37373f]";
  const nonActiveClasses = "text-[#72767f]";

  return (
    <Link to={link.path}>
      <div
        className={`flex gap-4 px-4 py-2 rounded-lg text-sm ${
          location.pathname == link.path ? activeClasses : nonActiveClasses
        }`}
      >
        <IonIcon icon={link.icon} size="small" />
        {link.title}
      </div>
    </Link>
  );
};
const LoginButton = () => {
  return (
    <Link to="/auth">
      <div className="float-right bg-blue-900 flex w-fit gap-4 px-4 py-2 rounded-lg text-sm">
        <IonIcon icon={logIn} size="small" />
        Login
      </div>
    </Link>
  );
};

export default function Navbar() {
  const user = useUser();
  return (
    <nav className="flex flex-col h-full border-r-3 rounded-2xl border-[#2d2e33] min-w-[250px] items-center justify-between py-12">
      <div className="flex justify-center items-center gap-2">
        <img src="/favicon.png" width="40px" />

        <h1 className="underline underline-offset-4 font-inconsolata text-xl uppercase font-medium tracking-wider">
          Invoice Suite
        </h1>
      </div>
      <div className="flex flex-col gap-2 px-3 w-full">
        {links.map((link) => (
          <CustomLinkComponent key={link.path} link={link} />
        ))}
      </div>
      <div className="w-full px-3 ">
        {user ? (
          <div className="flex justify-between items-center">
            <Avatar src={user.photoURL} />

            <Button
              color="danger"
              className="flex gap-4 px-4 py-2 rounded-lg text-sm"
              onClick={signOut}
            >
              <IonIcon icon={logOut} size="small" />
              Logout
            </Button>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </nav>
  );
}
