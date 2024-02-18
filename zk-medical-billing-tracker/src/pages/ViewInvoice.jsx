import { useState, useEffect } from "react";
import { Divider, Input, Radio, RadioGroup } from "@nextui-org/react";
import { IonIcon } from "@ionic/react";
import { arrowForwardCircleOutline } from "ionicons/icons";
import { createInvoice } from "../Firebase/firestore";
import useData from "../hooks/useData";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
const defaultItem = {
  name: "",
  quantity: 0,
  price: 0.0,
  total: 0.0,
};

export default function ViewInvoice() {
  let { uid } = useParams();
  const data = useData();

  const [senderAddress, setSenderAddress] = useState({
    street: "",
    city: "",
    postCode: "",
    country: "",
  });
  const [clientsAddress, setClientsAddress] = useState({
    street: "",
    city: "",
    postCode: "",
    country: "",
  });
  const [items, setItems] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState({
    paymentDueDate: "",
    invoiceTitle: "",
    description: "",
    clientName: "",
    clientEmail: "",
    senderName: "",
    senderEmail: "",
    status: "",
    invoiceTotal: 0.0,
  });

  useEffect(() => {
    if (!data) return;
    const invoices = data.invoices;
    const invoice = invoices.filter((item) => item.uid === uid)[0];
    if (!invoice) return;
    setInvoiceDetails(invoice);
    setSenderAddress(invoice.senderAddress);
    setClientsAddress(invoice.clientsAddress);
    setItems(invoice.items);
  }, [data]);

  return (
    <div className="flex gap-12 flex-col w-full px-6 py-14 h-fit">
      <div>
        <h2 className="mb-4">Invoice Details</h2>
        <div className="flex w-full gap-12">
          <Input
            readOnly
            className="w-full bg-[#37373f] rounded-xl"
            variant="bordered"
            isRequired
            label="Title"
            type="text"
            value={invoiceDetails.invoiceTitle}
          />
          <Input
            className="w-full bg-[#37373f] rounded-xl"
            variant="bordered"
            isRequired
            label="Description"
            type="text"
            value={invoiceDetails.description}
            readOnly
          />
        </div>
      </div>

      <div className="flex gap-12">
        <div className="p-8 bg-[#37373f] rounded-lg w-1/2">
          <h2 className="mb-1">Sender Details</h2>
          <Divider />
          <div className="mt-4 flex flex-col w-full gap-6">
            <div className="flex w-full gap-12">
              <Input
                className="w-full"
                variant="faded"
                isRequired
                label="Name"
                type="text"
                value={invoiceDetails.senderName}
                readOnly
              />
              <Input
                className="w-full"
                variant="faded"
                isRequired
                label="Email"
                type="email"
                value={invoiceDetails.senderEmail}
                readOnly
              />
            </div>
            <div className="">
              <h4>Address</h4>
              <div className="mt-4 flex gap-12 w-full">
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Street"
                  type="text"
                  value={senderAddress.street}
                  readOnly
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="City"
                  type="text"
                  value={senderAddress.city}
                  readOnly
                />
              </div>
              <div className="mt-4 flex gap-12 w-full">
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Postcode"
                  type="text"
                  value={senderAddress.postCode}
                  readOnly
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Country"
                  type="text"
                  value={senderAddress.country}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 bg-[#37373f] rounded-lg w-1/2">
          <h2 className="mb-1">Client Details</h2>
          <Divider />
          <div className="mt-4 flex flex-col w-full gap-6">
            <div className="flex w-full gap-12">
              <Input
                className="w-full"
                variant="faded"
                isRequired
                label="Name"
                type="text"
                value={invoiceDetails.clientName}
                readOnly
              />
              <Input
                className="w-full"
                variant="faded"
                isRequired
                label="Email"
                type="email"
                value={invoiceDetails.clientEmail}
                readOnly
              />
            </div>
            <div className="">
              <h4>Address</h4>
              <div className="mt-4 flex gap-12 w-full">
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Street"
                  type="text"
                  value={clientsAddress.street}
                  readOnly
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="City"
                  type="text"
                  value={clientsAddress.city}
                  readOnly
                />
              </div>
              <div className="mt-4 flex gap-12 w-full">
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Postcode"
                  type="text"
                  value={clientsAddress.postCode}
                  readOnly
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Country"
                  type="text"
                  value={clientsAddress.country}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-[#37373f] rounded-lg">
        <h2 className="text-xl">Items</h2>
        <Divider className="mt-1 mb-4" />

        <div className="flex flex-col gap-6">
          {items.length &&
            items.map((item, i) => (
              <div className="flex gap-8 items-center w-full" key={i}>
                <span className="min-w-fit bg-[#27272a] flex items-center px-4 rounded-full aspect-square">
                  {i + 1}
                </span>
                <Input
                  className="w-full rounded-xl"
                  variant="faded"
                  isRequired
                  label="Name"
                  type="text"
                  readOnly
                  value={item.name}
                />
                <Input
                  className="w-full rounded-xl"
                  variant="faded"
                  isRequired
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                />
                <Input
                  className="w-full rounded-xl"
                  variant="faded"
                  isRequired
                  label={`Price (${data?.currencySymbol})`}
                  type="number"
                  value={item.price}
                />
                <Input
                  className="w-full rounded-xl"
                  variant="faded"
                  isRequired
                  readOnly={true}
                  label={`Total (${data?.currencySymbol})`}
                  value={item.total || item.price * item.value}
                />
              </div>
            ))}
          <h2 className="text-end text-xl font-bold">
            Billing Amount {data?.currencySymbol} {invoiceDetails.invoiceTotal}
          </h2>
        </div>
      </div>

      <div className="h-full w-full gap-12 flex">
        <div className="min-w-fit bg-[#37373f] p-8 rounded-lg">
          <h2 className="text-xl">Misc</h2>
          <Divider className="mt-1 mb-4" />
          <div className="flex gap-8">
            <Input
              className="min-w-fit rounded-xl"
              variant="faded"
              isRequired
              label="Invoice Due Date"
              type="date"
              labelPlacement="outside-left"
              value={invoiceDetails.paymentDueDate}
            />
            <RadioGroup
              className="min-w-fit"
              label="Invoice Status"
              orientation="horizontal"
              value={invoiceDetails.status}
            >
              <Radio className="mr-4" value="draft">
                Draft
              </Radio>
              <Radio className="mr-4" value="pending">
                Pending
              </Radio>
              <Radio value="paid">Paid</Radio>
            </RadioGroup>
          </div>
        </div>
        <Link to={`/invoices/update/${uid}`} className="w-full">
          <div className="h-full cursor-pointer tracking-wider text-2xl w-full bg-[#0070f0] p-8 rounded-lg flex items-center justify-center gap-4">
            Update Invoice
            <IonIcon icon={arrowForwardCircleOutline} size="large" />
          </div>
        </Link>
      </div>
    </div>
  );
}
