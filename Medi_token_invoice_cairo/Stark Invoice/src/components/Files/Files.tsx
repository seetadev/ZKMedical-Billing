import React, { useState, useEffect } from "react";
import "./Files.css";
import * as AppGeneral from "../socialcalc/index.js";
import { DATA } from "../../app-data.js";
import { Local } from "../Storage/LocalStorage";
import {
  IonIcon,
  IonModal,
  IonItem,
  IonButton,
  IonList,
  IonLabel,
  IonAlert,
  IonItemGroup,
} from "@ionic/react";
import { fileTrayFull, trash, create } from "ionicons/icons";

const Files: React.FC<{
  store: Local;
  file: string;
  updateSelectedFile: Function;
  updateBillType: Function;
}> = (props) => {
  const [modal, setModal] = useState(null);
  const [listFiles, setListFiles] = useState(false);
  const [showAlert1, setShowAlert1] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);

  const editFile = (key) => {
    props.store._getFile(key).then((data) => {
      AppGeneral.viewFile(key, decodeURIComponent((data as any).content));
      props.updateSelectedFile(key);
      props.updateBillType((data as any).billType);
    });
  };

  const deleteFile = (key) => {
    setShowAlert1(true);
    setCurrentKey(key);
  };

  const loadDefault = () => {
    const msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
  };

  const _formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const temp = async () => {
    const files = await props.store._getAllFiles();
    const fileList = Object.keys(files).map((key) => {
      return (
        <IonItemGroup key={key}>
          <IonItem>
            <IonLabel>{key}</IonLabel>
            {_formatDate(files[key])}

            <IonIcon
              icon={create}
              color="warning"
              slot="end"
              size="large"
              onClick={() => {
                setListFiles(false);
                editFile(key);
              }}
            />

            <IonIcon
              icon={trash}
              color="danger"
              slot="end"
              size="large"
              onClick={() => {
                setListFiles(false);
                deleteFile(key);
              }}
            />
          </IonItem>
        </IonItemGroup>
      );
    });

    const ourModal = (
      <IonModal isOpen={listFiles} onDidDismiss={() => setListFiles(false)}>
        <IonList>{fileList}</IonList>
        <IonButton
          expand="block"
          color="secondary"
          onClick={() => {
            setListFiles(false);
          }}
        >
          Back
        </IonButton>
      </IonModal>
    );
    setModal(ourModal);
  };

  useEffect(() => {
    temp();
  }, [listFiles]);

  return (
    <React.Fragment>
      <IonIcon
        icon={fileTrayFull}
        className="ion-padding-end"
        slot="end"
        size="large"
        onClick={() => {
          setListFiles(true);
        }}
      />
      {modal}
      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header="Delete file"
        message={"Do you want to delete the " + currentKey + " file?"}
        buttons={[
          { text: "No", role: "cancel" },
          {
            text: "Yes",
            handler: () => {
              props.store._deleteFile(currentKey);
              loadDefault();
              setCurrentKey(null);
            },
          },
        ]}
      />
    </React.Fragment>
  );
};

export default Files;
