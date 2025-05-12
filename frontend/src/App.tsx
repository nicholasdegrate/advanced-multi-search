import { type ColumnDef } from "@tanstack/react-table";

import { fetchBuilding } from "@/api";
import {
  AdvancedSearch,
  type RelationRecord,
  type RelationRecordState,
} from "@/components/advaned-search";
import { DataTable } from "@/components/data-table";
import { useFetch } from "@/use-fetch";
import { useMemo } from "react";

type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  method: "credit_card" | "paypal" | "bank_transfer" | "cash";
  createdAt: string; // ISO date string
  customerId: string;
  refunded: boolean;
};

const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
    method: "credit_card",
    createdAt: "2024-11-01T10:15:00Z",
    customerId: "cust_001",
    refunded: false,
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
    method: "paypal",
    createdAt: "2024-11-02T14:22:00Z",
    customerId: "cust_002",
    refunded: false,
  },
  {
    id: "d1a7d2f2",
    amount: 150,
    status: "success",
    email: "example@example.com",
    method: "bank_transfer",
    createdAt: "2024-10-30T08:45:00Z",
    customerId: "cust_003",
    refunded: false,
  },
  {
    id: "a4f9f7e1",
    amount: 200,
    status: "failed",
    email: "fail@example.com",
    method: "credit_card",
    createdAt: "2024-11-03T09:10:00Z",
    customerId: "cust_004",
    refunded: false,
  },
  {
    id: "b91cc3f9",
    amount: 175,
    status: "success",
    email: "paid@example.com",
    method: "paypal",
    createdAt: "2024-10-29T17:30:00Z",
    customerId: "cust_005",
    refunded: true,
  },
  {
    id: "f35bc0f4",
    amount: 50,
    status: "success",
    email: "small@example.com",
    method: "cash",
    createdAt: "2024-10-31T12:00:00Z",
    customerId: "cust_006",
    refunded: false,
  },
  {
    id: "e82dd1a7",
    amount: 300,
    status: "processing",
    email: "big@example.com",
    method: "bank_transfer",
    createdAt: "2024-11-04T16:40:00Z",
    customerId: "cust_007",
    refunded: false,
  },
];

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "customerId",
    header: "Customer ID",
  },
  {
    accessorKey: "refunded",
    header: "Refunded",
    cell: ({ row }) => {
      const refunded = row.getValue("refunded");
      return refunded ? "Yes" : "No";
    },
  },
];

const defaultFilterValue = {
  field: "customer.fullName",
  operator: "contains",
};

export function App() {
  const buildings = useFetch(fetchBuilding);

  const relations = useMemo(() => {
    return {
      customer: [
        {
          label: "Full Name (customer)",
          value: "customer.fullName",
          type: "string",
        },
        { label: "Email (customer)", value: "customer.email", type: "string" },
        {
          label: "Phone Number (customer)",
          value: "customer.phoneNumber",
          type: "string",
        },
        {
          label: "Created At (customer)",
          value: "customer.createdAt",
          type: "date",
        },
      ],
      order: [
        { label: "Order ID", value: "customer.order.id", type: "string" },
        {
          label: "Product Title (order)",
          value: "customer.order.product.title",
          type: "string",
        },
        {
          label: "Ordered At (order)",
          value: "customer.order.orderedAt",
          type: "date",
        },
      ],
      building: [
        {
          label: "Name (building)",
          value: "customer.building.name",
          type: "select",
          options: {
            placeholder: "Select a building...",
            loading: buildings.loading,
            data: buildings.data.map((b) => ({
              label: b.name,
              value: b.id,
            })),
          },
        },
      ],
    } satisfies Record<string, RelationRecord[]>;
  }, [buildings]);

  return (
    <div className="max-w-4xl m-auto mt-10">
      <div className="flex items-center py-4">
        <AdvancedSearch
          defaultFilterValue={defaultFilterValue}
          relations={relations}
          onSearch={function (filters: RelationRecordState[]): void {
            console.log(filters);
          }}
        />
      </div>
      <DataTable columns={columns} data={payments} />
    </div>
  );
}
