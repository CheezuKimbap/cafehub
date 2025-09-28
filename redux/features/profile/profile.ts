export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  currentStamps?: number;
}

export interface Profile {
  id: string;
  customerId: string;
  phoneNumber?: string;
  preferences?: string;
  address?: string;
}
