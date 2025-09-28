"use client";

import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCustomerById,
  selectSingleCustomer,
  selectCustomerStatus,
} from "@/redux/features/customer/customerSlice";

import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";

export default function Page() {
  const params = useParams();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const dispatch = useAppDispatch();
  const customer = useAppSelector(selectSingleCustomer);
  const status = useAppSelector(selectCustomerStatus);

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
    }
  }, [dispatch, customerId]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-20">
      <Card className="rounded-2xl shadow-lg border border-gray-200">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={customer?.user?.image ?? ""}
              alt={customer?.firstName}
            />
            <AvatarFallback>
              {customer?.firstName?.[0]}
              {customer?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">
            {customer?.firstName} {customer?.lastName}
          </CardTitle>
          <p className="text-gray-500">{customer?.email}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={customer?.profile?.phoneNumber ?? ""}
                readOnly
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={customer?.profile?.address ?? ""}
                readOnly
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preferences">Preferences</Label>
              <Input
                id="preferences"
                value={customer?.profile?.preferences ?? ""}
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Edit Profile</Button>
            <Button className="bg-black text-white">Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
