/* ---------------- Types for Sales ---------------- */

import { PaymentStatus } from "./purchase";
import { PaymentMethod } from "./supplierDue";



export type TSaleRow = {
  key: string;             
  _id?: string;            

  date: string;           
  invoiceNo: string;       

  customerName: string;    
  productName: string;     

  quantity: number;        

  totalAmount: number;    
  paidAmount: number;    
  dueAmount: number;     

  paymentMethod?: PaymentMethod;
  status: PaymentStatus;  
  note?: string;          
};

export type SalesFiltersState = {
  paymentFilter?: string;
  customerFilter: string;
  invoiceFilter: string;
  dateRange: any;
};