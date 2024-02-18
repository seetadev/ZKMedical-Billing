import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { initializeFirebase } from "../Firebase";

function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    initializeFirebase();
    const auth = getAuth();
    if (auth == null) {
      setUser(null);
    } else {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      });
    }
  }, []);
  return user;
}

export default useUser;
