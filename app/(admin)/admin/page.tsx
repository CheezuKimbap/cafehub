import { redirect } from "next/navigation";
import React from "react";

function AdminPage() {
  redirect("/admin/dashboard");
}

export default AdminPage;
