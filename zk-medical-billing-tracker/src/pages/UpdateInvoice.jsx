import { useState, useEffect } from "react";
import { Divider, Input, Radio, RadioGroup } from "@nextui-org/react";
import { IonIcon } from "@ionic/react";
import { addCircleOutline, arrowForwardCircleOutline } from "ionicons/icons";
import { updateInvoice } from "../Firebase/firestore";
import useData from "../hooks/useData";
import { useParams } from "react-router";
const defaultItem = {
  name: "",
  quantity: 0,
  price: 0.0,
  total: 0.0,
};

export default function UpdateInvoice() {
  const { uid } = useParams();
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
    setSenderAddress(invoice.senderAddress);
    setClientsAddress(invoice.clientsAddress);
    setItems(invoice.items);
    setInvoiceDetails(invoice);
  }, [data]);
  useEffect(() => {
    if (!items || !data) return;
    let sum = 0;
    items.forEach((item) => {
      sum += item.total;
    });
    setInvoiceDetails((prev) => {
      return { ...prev, invoiceTotal: sum };
    });
  }, [items]);

  return (
    <div className="flex gap-12 flex-col w-full px-6 py-14 h-fit">
      <div>
        <h2 className="mb-4">Invoice Details</h2>
        <div className="flex w-full gap-12">
          <Input
            className="w-full bg-[#37373f] rounded-xl"
            variant="bordered"
            isRequired
            label="Title"
            type="text"
            value={invoiceDetails.invoiceTitle}
            onChange={(e) =>
              setInvoiceDetails((prev) => {
                return { ...prev, invoiceTitle: e.target.value };
              })
            }
          />
          <Input
            className="w-full bg-[#37373f] rounded-xl"
            variant="bordered"
            isRequired
            label="Description"
            type="text"
            value={invoiceDetails.description}
            onChange={(e) =>
              setInvoiceDetails((prev) => {
                return { ...prev, description: e.target.value };
              })
            }
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
                onChange={(e) =>
                  setInvoiceDetails((prev) => {
                    return { ...prev, senderName: e.target.value };
                  })
                }
              />
              <Input
                className="w-full"
                variant="faded"
                isRequired
                label="Email"
                type="email"
                value={invoiceDetails.senderEmail}
                onChange={(e) =>
                  setInvoiceDetails((prev) => {
                    return { ...prev, senderEmail: e.target.value };
                  })
                }
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
                  onChange={(e) =>
                    setSenderAddress((prev) => {
                      return { ...prev, street: e.target.value };
                    })
                  }
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="City"
                  type="text"
                  value={senderAddress.city}
                  onChange={(e) =>
                    setSenderAddress((prev) => {
                      return { ...prev, city: e.target.value };
                    })
                  }
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
                  onChange={(e) =>
                    setSenderAddress((prev) => {
                      return { ...prev, postCode: e.target.value };
                    })
                  }
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Country"
                  type="text"
                  value={senderAddress.country}
                  onChange={(e) =>
                    setSenderAddress((prev) => {
                      return { ...prev, country: e.target.value };
                    })
                  }
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
                onChange={(e) =>
                  setInvoiceDetails((prev) => {
                    return { ...prev, clientName: e.target.value };
                  })
                }
              />
              <Input
                className="w-full"
                variant="faded"
                isRequired
                label="Email"
                type="email"
                value={invoiceDetails.clientEmail}
                onChange={(e) =>
                  setInvoiceDetails((prev) => {
                    return { ...prev, clientEmail: e.target.value };
                  })
                }
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
                  onChange={(e) =>
                    setClientsAddress((prev) => {
                      return { ...prev, street: e.target.value };
                    })
                  }
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="City"
                  type="text"
                  value={clientsAddress.city}
                  onChange={(e) =>
                    setClientsAddress((prev) => {
                      return { ...prev, city: e.target.value };
                    })
                  }
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
                  onChange={(e) =>
                    setClientsAddress((prev) => {
                      return { ...prev, postCode: e.target.value };
                    })
                  }
                />
                <Input
                  className="w-full"
                  variant="faded"
                  isRequired
                  label="Country"
                  type="text"
                  value={clientsAddress.country}
                  onChange={(e) =>
                    setClientsAddress((prev) => {
                      return { ...prev, country: e.target.value };
                    })
                  }
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
                  value={item.name}
                  onChange={(e) => {
                    const prevElement = item;
                    prevElement.name = e.target.value;
                    items[i] = prevElement;
                    setItems([...items]);
                  }}
                />
                <Input
                  className="w-full rounded-xl"
                  variant="faded"
                  isRequired
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const prevElement = item;
                    prevElement.quantity = parseInt(e.target.value);
                    prevElement.total =
                      prevElement.price * prevElement.quantity;
                    items[i] = prevElement;
                    setItems([...items]);
                  }}
                />
                <Input
                  className="w-full rounded-xl"
                  variant="faded"
                  isRequired
                  label={`Price (${data?.currencySymbol})`}
                  type="number"
                  value={item.price}
                  onChange={(e) => {
                    const prevElement = item;
                    prevElement.price = parseFloat(e.target.value);
                    prevElement.total =
                      prevElement.price * prevElement.quantity;
                    items[i] = prevElement;
                    setItems([...items]);
                  }}
                />
                <Input
                  className="w-full rounded-xl"
                  variant="faded"
                  isRequired
                  readOnly={true}
                  label={`Total (${data?.currencySymbol})`}
                  labelPlacement="inside"
                  placeholder="Total = Price * Quantity"
                  type="text"
                  value={item.total || 0.0}
                />
              </div>
            ))}
          <h2 className="text-end text-xl font-bold">
            Billing Amount {data?.currencySymbol} {invoiceDetails.invoiceTotal}
          </h2>
        </div>
        <div className="mt-4 add-items-btn flex justify-center items-center cursor-pointer">
          <IonIcon
            className="bg-[#55555c] rounded-full"
            icon={addCircleOutline}
            size="large"
            onClick={() => {
              setItems((prev) => [...prev, { ...defaultItem }]);
            }}
          />
        </div>
      </div>

      <div className="w-full gap-12 flex">
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
              value={invoiceDetails.paymentDueDate}
              labelPlacement="outside-left"
              onChange={(e) => {
                setInvoiceDetails((prev) => {
                  return { ...prev, paymentDueDate: e.target.value };
                });
              }}
            />
            <RadioGroup
              className="min-w-fit"
              label="Invoice Status"
              orientation="horizontal"
              value={invoiceDetails.status}
              onChange={(e) =>
                setInvoiceDetails((prev) => {
                  return { ...prev, status: e.target.value };
                })
              }
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
        <div
          className="cursor-pointer tracking-wider text-2xl w-full bg-[#0070f0] p-8 rounded-lg flex items-center justify-center gap-4"
          onClick={() => {
            updateInvoice(
              uid,
              invoiceDetails,
              senderAddress,
              clientsAddress,
              items
            );
          }}
        >
          Update Invoice
          <IonIcon icon={arrowForwardCircleOutline} size="large" />
        </div>
      </div>
    </div>
  );
}
