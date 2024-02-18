import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Pagination,
} from "@nextui-org/react";
import { EditIcon } from "../icons/EditIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { EyeIcon } from "../icons/EyeIcon";
import useData from "../hooks/useData";
import { deleteInvoice } from "../Firebase/firestore";
import { Link } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { mailOutline } from "ionicons/icons";
import emailjs from "@emailjs/browser";

const columns = [
  { name: "Title", uid: "invoiceTitle" },
  { name: "Created At", uid: "createdAt" },
  { name: "Client Name", uid: "clientName" },
  { name: "Invoice Amount", uid: "invoiceTotal" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions" },
];
const statusColorMap = {
  paid: "success",
  draft: "danger",
  pending: "warning",
};

function itemStr(item, currencySymbol) {
  return `<tr style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top;"valign="top"><td style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;text-decoration:none;vertical-align:top;border-width:1px;padding:0.5em;position:relative;text-align:left;border-radius:0.25em;border-style:solid;border-color:#ddd;width:26%;"width="26%"valign="top"align="left"><span style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top;">${item.name}</span></td><td style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;text-decoration:none;vertical-align:top;border-width:1px;padding:0.5em;position:relative;text-align:left;border-radius:0.25em;border-style:solid;border-color:#ddd;width:38%;"width="38%"valign="top"align="left"><span style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top;">${item.quantity}</span></td><td style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;text-decoration:none;vertical-align:top;border-width:1px;padding:0.5em;position:relative;border-radius:0.25em;border-style:solid;border-color:#ddd;text-align:right;width:12%;"width="12%"valign="top"align="right"><span data-prefix=""style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top;">${currencySymbol}</span><span style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top;">${item.price}</span></td><td style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;text-decoration:none;vertical-align:top;border-width:1px;padding:0.5em;position:relative;border-radius:0.25em;border-style:solid;border-color:#ddd;text-align:right;width:12%;"width="12%"valign="top"align="right"><span data-prefix=""style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top;">${currencySymbol}</span><span style="border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top;">${item.price}</span></td></tr>`;
}

function getTableRowsHTML(items, currencySymbol) {
  let str = "";
  items.forEach((item) => {
    str = str.concat(itemStr(item, currencySymbol));
  });
  return str;
}

function sendEmailToClient(invoice, currencySymbol) {
  let yourDate = new Date(invoice.createdAt.seconds * 1000);
  yourDate = yourDate.toISOString().split("T")[0];
  emailjs
    .send(
      "service_ybnmn0v",
      "template_wsyy3xr",
      {
        ...invoice,
        clientStreet: invoice.clientsAddress.street,
        clientCity: invoice.clientsAddress.city,
        clientPostCode: invoice.clientsAddress.postcode,
        clientCountry: invoice.clientsAddress.country,
        senderStreet: invoice.senderAddress.street,
        senderCity: invoice.senderAddress.city,
        senderPostCode: invoice.senderAddress.postcode,
        senderCountry: invoice.senderAddress.country,
        tableRowsHTML: getTableRowsHTML(invoice.items, currencySymbol),
        currencySymbol: currencySymbol,
        createdAtDate: yourDate,
        from_name: `${invoice.senderName} ${invoice.senderEmail}`,
      },
      "jfboO5uLvrXJSVWvS"
    )
    .then(
      (result) => {
        alert(`Email Sent to ${invoice.clientEmail}`);
      },
      (error) => {
        console.error("Email Not Sent " + error);
      }
    );
}

export default function Invoices() {
  const [refresh, setRefresh] = React.useState(1);
  const data = useData(refresh);

  const [page, setPage] = React.useState(1);
  const [invoices, setInvoices] = React.useState([]);
  const rowsPerPage = 13;
  const pages = Math.ceil(invoices.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return invoices.slice(start, end);
  }, [page, invoices]);
  useEffect(() => {
    setInvoices(data?.invoices.reverse() || []);
  }, [data]);
  const refreshData = () =>
    setRefresh((prev) => {
      return !prev;
    });

  const renderCell = React.useCallback((invoice, columnKey, currencySymbol) => {
    const cellValue = invoice[columnKey];
    let yourDate;
    if (columnKey == "createdAt") {
      yourDate = new Date(cellValue.seconds * 1000);
      yourDate = yourDate.toISOString().split("T")[0];
    }
    switch (columnKey) {
      case "createdAt":
        return yourDate;
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[invoice.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="See Invoice">
              <Link to={`/invoices/view/${invoice.uid}`}>
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EyeIcon />
                </span>
              </Link>
            </Tooltip>
            <Tooltip content="Mail Invoice">
              <span
                onClick={() => sendEmailToClient(invoice, currencySymbol)}
                className="h-5 text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <IonIcon icon={mailOutline} />
              </span>
            </Tooltip>
            <Tooltip content="Edit Invoice">
              <Link to={`/invoices/update/${invoice.uid}`}>
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EditIcon />
                </span>
              </Link>
            </Tooltip>
            <Tooltip color="danger" content="Delete Invoice">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => deleteInvoice(invoice.uid, refreshData)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <div className="flex w-full pt-14 px-7">
      <Table
        aria-label="Example table with custom cells"
        bottomContent={
          invoices.length > 10 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={`${Math.random()}`}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey, data.currencySymbol || "₹")}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
