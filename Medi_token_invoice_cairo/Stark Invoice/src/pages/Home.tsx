import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonPopover,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonButtons,
} from "@ionic/react";
import { APP_NAME, DATA } from "../app-data";
import * as AppGeneral from "../components/socialcalc/index.js";
import { useEffect, useState } from "react";
import { Local } from "../components/Storage/LocalStorage";
import {
  menu,
  settings,
  cloudUpload,
  listOutline,
  card,
  wallet,
  star,
} from "ionicons/icons";
import "./Home.css";
import Menu from "../components/Menu/Menu";
import Files from "../components/Files/Files";
import NewFile from "../components/NewFile/NewFile";
import WalletConnection from "../components/WalletConnection";
import SpreadsheetToIPFS from "../components/SpreadsheetToIPFS";
import SpreadsheetFromIPFS from "../components/SpreadsheetFromIPFS";
import Subscription from "../components/Subscription";

const Home: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({ open: false, event: undefined });
  const [selectedFile, updateSelectedFile] = useState("default");
  const [billType, updateBillType] = useState(1);
  const [device] = useState("default");
  const [showBlockchainSection, setShowBlockchainSection] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const store = new Local();

  const closeMenu = () => {
    setShowMenu(false);
  };

  const activateFooter = (footer) => {
    AppGeneral.activateFooterButton(footer);
  };

  useEffect(() => {
    const data = DATA["home"][device]["msc"];
    AppGeneral.initializeApp(JSON.stringify(data));
  }, []);

  useEffect(() => {
    activateFooter(billType);
  }, [billType]);

  const footers = DATA["home"][device]["footers"];
  const footersList = footers.map((footerArray) => {
    return (
      <IonButton
        key={footerArray.index}
        expand="full"
        color="light"
        className="ion-no-margin"
        onClick={() => {
          updateBillType(footerArray.index);
          activateFooter(footerArray.index);
          setShowPopover({ open: false, event: undefined });
        }}
      >
        {footerArray.name}
      </IonButton>
    );
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{APP_NAME}</IonTitle>
          <IonButtons slot="end">
            <WalletConnection />
            <IonButton
              fill="clear"
              onClick={() => setShowSubscriptionModal(true)}
            >
              <IonIcon icon={star} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonToolbar color="primary">
          <IonIcon
            icon={settings}
            slot="end"
            className="ion-padding-end"
            size="large"
            onClick={(e) => {
              setShowPopover({ open: true, event: e.nativeEvent });
              console.log("Popover clicked");
            }}
          />
          <Files
            store={store}
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            updateBillType={updateBillType}
          />

          <NewFile
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            store={store}
            billType={billType}
          />
          <IonPopover
            animated
            keyboardClose
            backdropDismiss
            event={showPopover.event}
            isOpen={showPopover.open}
            onDidDismiss={() =>
              setShowPopover({ open: false, event: undefined })
            }
          >
            {footersList}
          </IonPopover>
        </IonToolbar>
        <IonToolbar color="secondary">
          <IonTitle className="ion-text-center">
            Editing : {selectedFile}
          </IonTitle>
        </IonToolbar>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton type="button" onClick={() => setShowMenu(true)}>
            <IonIcon icon={menu} />
          </IonFabButton>
        </IonFab>

        <Menu
          showM={showMenu}
          setM={closeMenu}
          file={selectedFile}
          updateSelectedFile={updateSelectedFile}
          store={store}
          bT={billType}
        />

        {/* Blockchain Integration Section */}
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Blockchain Integration</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={() =>
                      setShowBlockchainSection(!showBlockchainSection)
                    }
                  >
                    {showBlockchainSection ? "Hide" : "Show"} Blockchain
                    Features
                  </IonButton>

                  {showBlockchainSection && (
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <SpreadsheetToIPFS
                            store={store}
                            selectedFile={selectedFile}
                            onFileUploaded={(ipfsHash) => {
                              console.log("File uploaded:", ipfsHash);
                            }}
                          />
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <SpreadsheetFromIPFS
                            onDataLoaded={(data) => {
                              console.log("Spreadsheet data loaded:", data);
                              // Update the selected file if needed
                              if (data.fileName) {
                                updateSelectedFile(data.fileName);
                              }
                            }}
                          />
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Subscription Modal */}
        <IonModal
          isOpen={showSubscriptionModal}
          onDidDismiss={() => setShowSubscriptionModal(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Subscription Management</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowSubscriptionModal(false)}>
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <Subscription />
          </IonContent>
        </IonModal>

        <div id="container">
          <div id="workbookControl"></div>
          <div id="tableeditor"></div>
          <div id="msg"></div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
