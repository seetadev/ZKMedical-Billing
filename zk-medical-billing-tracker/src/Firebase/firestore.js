import { getAuth } from "firebase/auth";
import { db } from "./index";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { uid } from "uid";

const defaultData = {
  invoices: [],
  companyName: "Invoice Suite",
  currencySymbol: "₹",
  lastWeekMetric: [
    { day: "Monday", amount: 1200 },
    { day: "Tuesday", amount: 1800 },
    { day: "Wednesday", amount: 1000 },
    { day: "Thursday", amount: 1900 },
    { day: "Friday", amount: 2200 },
    { day: "Saturday", amount: 2300 },
    { day: "Sunday", amount: 1500 },
  ],
  totalAmountProcessed: 0,
};

const createDocumentOnUserSignUp = async (user) => {
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return user;
    } else {
      await setDoc(docRef, defaultData);
      return user;
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
const updateCompanyName = async (newName) => {
  const auth = getAuth();
  const user = auth.currentUser;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    await updateDoc(docRef, { ...docSnap.data(), companyName: newName })
      .then(() => alert("Company Name Updated"))
      .catch(() => alert("Something Went Wrong"));
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
const updateCurrencySymbol = async (newName) => {
  const auth = getAuth();
  const user = auth.currentUser;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    await updateDoc(docRef, { ...docSnap.data(), currencySymbol: newName })
      .then(() => alert("Currency Symbol Updated"))
      .catch(() => alert("Something Went Wrong"));
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
const createInvoice = async (
  invoiceDetails,
  senderAddress,
  clientsAddress,
  items
) => {
  const auth = getAuth();
  const user = auth.currentUser;
  let yourDate = new Date();
  yourDate.toISOString().split("T")[0];

  const newInvoice = {
    uid: uid(),
    ...invoiceDetails,
    senderAddress: senderAddress,
    clientsAddress: clientsAddress,
    items: items,
    createdAt: yourDate,
  };

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data();
    await updateDoc(docRef, {
      ...docData,
      totalAmountProcessed:
        newInvoice.invoiceTotal + docData.totalAmountProcessed,
      invoices: [...docData.invoices, newInvoice],
    })
      .then(() => alert("Invoice Created"))
      .catch(() => alert("Something Went Wrong"));
  } catch (e) {
    console.error("Something Went Wrong: ", e);
  }
};
const updateInvoice = async (
  uid,
  invoiceDetails,
  senderAddress,
  clientsAddress,
  items
) => {
  const auth = getAuth();
  const user = auth.currentUser;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data();
    let i = 0;
    let invoice = docData.invoices.filter((item, index) => {
      if (item.uid === uid) i = index;
      return item.uid === uid;
    })[0];
    invoice = {
      ...invoiceDetails,
      clientsAddress: clientsAddress,
      senderAddress: senderAddress,
      items: items,
    };
    docData.invoices[i] = invoice;
    await updateDoc(docRef, docData)
      .then(() => alert("Invoice Updated"))
      .catch(() => alert("Something Went Wrong"));
  } catch (e) {
    console.error("Something Went Wrong: ", e);
  }
};

const deleteInvoice = async (uid, refreshData) => {
  const auth = getAuth();
  const user = auth.currentUser;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data();
    const totalAmount = docData.totalAmountProcessed;
    let invoiceAmount = 0;
    const updatedData = { ...docData };
    updatedData.invoices = updatedData.invoices.filter((item) => {
      if (item.uid === uid) {
        invoiceAmount = item.invoiceTotal;
      }
      return item.uid !== uid;
    });

    updatedData.totalAmountProcessed = totalAmount - invoiceAmount;

    await updateDoc(docRef, updatedData)
      .then(() => {
        alert("Invoice Deleted");
        refreshData();
      })
      .catch(() => alert("Something Went Wrong"));
  } catch (e) {
    console.error("Something Went Wrong: ", e);
  }
};

export {
  createDocumentOnUserSignUp,
  updateCompanyName,
  createInvoice,
  updateCurrencySymbol,
  deleteInvoice,
  updateInvoice,
};
