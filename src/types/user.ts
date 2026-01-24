export interface TUser {
    _id: string;
    name: string;
    email: string;
    address: string;
    image: string;
    gender: string;
    age:number;
    role: string;
    isVerify?: boolean;
    status?: "Active" | "Blocked";
    phoneNumber: string;
    __v: number;
  } 
  