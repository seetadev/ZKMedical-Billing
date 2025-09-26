import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export class AuthService {
  // Sign in with email and password
  signIn = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  };

  // Sign up with email and password
  signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
      };
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  };

  // Sign out
  signOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Send password reset email
  resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  };

  // Get current user
  getCurrentUser = (): User | null => {
    return auth.currentUser;
  };

  // Check if user is authenticated
  isAuthenticated = (): boolean => {
    return !!auth.currentUser;
  };

  // Listen to authentication state changes
  onAuthStateChanged = (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        callback(null);
      }
    });
  };

  // Get user-friendly error messages
  private getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No user found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };
}

export const authService = new AuthService();
