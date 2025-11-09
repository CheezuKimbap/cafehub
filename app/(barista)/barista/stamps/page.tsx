import CustomerTablePage from "@/components/barista/stamp/CustomerTable";
import { redirect } from "next/navigation";
import React from "react";

function StampsPage() {
  return (<>
    <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Stamp</h2>
        <CustomerTablePage/>
    </div>
  </>);
}

export default StampsPage;
