import React, { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonContent,
  IonToast,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonAlert,
} from "@ionic/react";
import { close, logOut, person, mail, key } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";

interface FirebaseAuthProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

const FirebaseAuth: React.FC<FirebaseAuthProps> = ({
  isOpen,
  onDidDismiss,
}) => {
  const { user, signIn, signUp, signOut, resetPassword, isAuthenticated } =
    useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("danger");
  const [showSignOutAlert, setShowSignOutAlert] = useState(false);
  const [showResetPasswordAlert, setShowResetPasswordAlert] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const showToastMessage = (
    message: string,
    color: "success" | "danger" | "warning" = "danger"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      showToastMessage("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      showToastMessage("Successfully signed in!", "success");
      clearForm();
      onDidDismiss();
    } catch (error: any) {
      showToastMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      showToastMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      showToastMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      showToastMessage("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, displayName);
      showToastMessage("Account created successfully!", "success");
      clearForm();
      onDidDismiss();
    } catch (error: any) {
      showToastMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      showToastMessage("Successfully signed out!", "success");
      clearForm();
      setShowSignOutAlert(false);
    } catch (error: any) {
      showToastMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      showToastMessage("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(resetEmail);
      showToastMessage("Password reset email sent!", "success");
      setResetEmail("");
      setShowResetPasswordAlert(false);
    } catch (error: any) {
      showToastMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthenticatedView = () => (
    <IonContent>
      <div style={{ padding: "20px" }}>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={person} style={{ marginRight: "8px" }} />
              Account Information
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={mail} slot="start" />
                <IonLabel>
                  <h3>Email</h3>
                  <p>{user?.email}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h3>Display Name</h3>
                  <p>{user?.displayName || "Not set"}</p>
                </IonLabel>
              </IonItem>
            </IonList>

            <div style={{ marginTop: "20px" }}>
              <IonButton
                expand="block"
                fill="outline"
                color="danger"
                onClick={() => setShowSignOutAlert(true)}
                disabled={isLoading}
              >
                <IonIcon icon={logOut} slot="start" />
                Sign Out
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  );

  const renderUnauthenticatedView = () => (
    <IonContent>
      <div style={{ padding: "20px" }}>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={key} style={{ marginRight: "8px" }} />
              Firebase Authentication
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSegment
              value={authMode}
              onIonChange={(e) =>
                setAuthMode(e.detail.value as "signin" | "signup")
              }
            >
              <IonSegmentButton value="signin">
                <IonLabel>Sign In</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="signup">
                <IonLabel>Sign Up</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <div style={{ marginTop: "20px" }}>
              {authMode === "signup" && (
                <IonItem>
                  <IonLabel position="stacked">Display Name</IonLabel>
                  <IonInput
                    type="text"
                    value={displayName}
                    onIonInput={(e) => setDisplayName(e.detail.value!)}
                    placeholder="Enter your display name"
                  />
                </IonItem>
              )}

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  placeholder="Enter your email"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value!)}
                  placeholder="Enter your password"
                />
              </IonItem>

              {authMode === "signup" && (
                <IonItem>
                  <IonLabel position="stacked">Confirm Password</IonLabel>
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                    placeholder="Confirm your password"
                  />
                </IonItem>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <IonButton
                expand="block"
                onClick={authMode === "signin" ? handleSignIn : handleSignUp}
                disabled={isLoading}
              >
                {isLoading && (
                  <IonSpinner name="crescent" style={{ marginRight: "8px" }} />
                )}
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </IonButton>

              {authMode === "signin" && (
                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={() => setShowResetPasswordAlert(true)}
                  disabled={isLoading}
                  style={{ marginTop: "10px" }}
                >
                  Forgot Password?
                </IonButton>
              )}
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  );

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {isAuthenticated ? "Account Settings" : "Firebase Authentication"}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onDidDismiss}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        {isAuthenticated
          ? renderAuthenticatedView()
          : renderUnauthenticatedView()}
      </IonModal>

      {/* Sign Out Confirmation Alert */}
      <IonAlert
        isOpen={showSignOutAlert}
        onDidDismiss={() => setShowSignOutAlert(false)}
        header="Sign Out"
        message="Are you sure you want to sign out?"
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Sign Out",
            handler: handleSignOut,
          },
        ]}
      />

      {/* Reset Password Alert */}
      <IonAlert
        isOpen={showResetPasswordAlert}
        onDidDismiss={() => setShowResetPasswordAlert(false)}
        header="Reset Password"
        message="Enter your email address to receive a password reset link."
        inputs={[
          {
            name: "email",
            type: "email",
            placeholder: "Email address",
            value: resetEmail,
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Send Reset Email",
            handler: (data) => {
              setResetEmail(data.email);
              handleResetPassword();
            },
          },
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="top"
        color={toastColor}
      />
    </>
  );
};

export default FirebaseAuth;
