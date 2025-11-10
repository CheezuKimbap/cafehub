// CustomerTablePage.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCustomers,
  selectCustomers,
} from "@/redux/features/customer/customerSlice";
import { DataTable } from "@/components/ui/data-table";
import { customerColumns } from "./columns";

export default function CustomerTablePage() {
  const dispatch = useAppDispatch();
  const customers = useAppSelector(selectCustomers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4">
        <DataTable columns={customerColumns} data={customers} />
      </div>
    </>
  );
}
