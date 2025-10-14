"use client";

import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCustomerById,
  selectSingleCustomer,
  selectCustomerStatus,
} from "@/redux/features/customer/customerSlice";
import { updateProfile } from "@/redux/features/profile/profileslice";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Page() {
  const params = useParams();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const dispatch = useAppDispatch();
  const customer = useAppSelector(selectSingleCustomer);
  const status = useAppSelector(selectCustomerStatus);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
    preferences: "",
    password: "", // new password
    confirmPassword: "", // confirm
  });

  // Fetch customer on mount
  useEffect(() => {
    if (customerId) dispatch(fetchCustomerById(customerId));
  }, [dispatch, customerId]);

  // Populate form data when customer is loaded
  useEffect(() => {
    if (!customer) return;
    setFormData((prev) => ({
      ...prev,
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      phoneNumber: customer.profile?.phoneNumber ?? "",
      address: customer.profile?.address ?? "",
      preferences: customer.profile?.preferences ?? "",
    }));
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!customerId) return;

    // simple client-side check
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    await dispatch(
      updateProfile({
        customerId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        preferences: formData.preferences,
        ...(formData.password ? { password: formData.password } : {}),
      }),
    );
    setEditMode(false);
    setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" })); // clear after save
  };

  if (status === "loading" || !customer) {
    return <p className="text-center mt-10">Loading...</p>;
  }
  const isOAuth =
    customer?.user?.accountCount && customer.user.accountCount > 0;
  return (
    <div className="w-full max-w-3xl mx-auto mt-20">
      <Card className="rounded-2xl shadow-lg border border-gray-200">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={customer.user?.image ?? ""}
              alt={customer.firstName}
            />
            <AvatarFallback>
              {customer.firstName?.[0]}
              {customer.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">
            {customer.firstName} {customer.lastName}
          </CardTitle>
          <p className="text-gray-500">{customer.email}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {/* Basic Info */}
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </div>

            {!isOAuth && (
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!editMode}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preferences">Preferences</Label>
              <Input
                id="preferences"
                value={formData.preferences}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </div>

            {/* Password fields */}
            {editMode && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {editMode ? (
              <>
                <Button className="bg-black text-white" onClick={handleSubmit}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
