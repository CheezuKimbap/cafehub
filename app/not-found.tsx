// app/404.tsx (for App Router)
import { redirect } from "next/navigation";
export default function NotFound() {
  redirect("/");
}
