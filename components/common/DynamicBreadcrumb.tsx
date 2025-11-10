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
import React, { useEffect, useState } from "react";

const ROUTE_LABELS: Record<string, string> = {
  menu: "Menu",
  drinks: "Drinks",
  coffee: "Coffee",
  about: "About",
  contact: "Contact",
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadNames() {
      const result: Record<string, string> = {};

      for (const part of pathParts) {
        const isUUID = /^[0-9a-fA-F-]{36}$/.test(part);
        if (isUUID) {
          try {
            const res = await fetch(`/api/products/${part}`, {
              cache: "no-store",
            });
            if (res.ok) {
              const data = await res.json();
              result[part] = data?.name ?? "Unknown Product";
            } else {
              result[part] = "Unknown Product";
            }
          } catch {
            result[part] = "Unknown Product";
          }
        }
      }

      setResolved(result);
    }

    loadNames();
  }, [pathname]);

  const breadcrumbs = pathParts
    .map((part, idx) => {
      const isUUID = /^[0-9a-fA-F-]{36}$/.test(part);
      const href = "/" + pathParts.slice(0, idx + 1).join("/");

      // Hide UUID path segment until resolved
      if (isUUID && !resolved[part]) return null;

      const label =
        resolved[part] ||
        ROUTE_LABELS[part] ||
        part.charAt(0).toUpperCase() + part.slice(1);

      return { href, label };
    })
    .filter(Boolean); // remove nulls

  return (
    <Breadcrumb className="py-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb?.href}>
            <BreadcrumbSeparator />
            {idx === breadcrumbs.length - 1 ? (
              <BreadcrumbPage>{crumb?.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={crumb!.href}>{crumb?.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
