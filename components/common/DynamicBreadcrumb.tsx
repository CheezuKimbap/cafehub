"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import React from "react";

// Optional mapping for friendly names
const ROUTE_LABELS: Record<string, string> = {
  menu: "Menu",
  drinks: "Drinks",
  coffee: "Coffee",
  about: "About",
  contact: "Contact",
};

export function DynamicBreadcrumb() {
  const pathname = usePathname(); // e.g. /menu/drinks/coffee
  const pathParts = pathname.split("/").filter(Boolean);

  // Build hrefs for each part
  const breadcrumbs = pathParts.map((part, idx) => {
    const href = "/" + pathParts.slice(0, idx + 1).join("/");
    const label =
      ROUTE_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1);
    return { href, label };
  });

  return (
    <Breadcrumb className="my-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbSeparator />
            {idx === breadcrumbs.length - 1 ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
