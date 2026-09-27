import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BillItem = {
  id: string;
  name: string;
  partNumber: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  gst: number;
};

export type Bill = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplier: string;
  supplierGstin: string;
  address: string;
  placeOfSupply: string;
  paymentTerms: string;
  items: BillItem[];
};

const makeBill = (id: string, invoiceNumber: string, invoiceDate: string, supplier: string, item: Omit<BillItem, 'id'>, supplierGstin = '33ABCDE1234F1Z1', address = 'G.P. Road, Chennai') => ({
  id, invoiceNumber, invoiceDate, supplier, supplierGstin, address, placeOfSupply: 'Tamil Nadu', paymentTerms: 'Credit',
  items: [{ ...item, id: `${id}-item` }],
});

export const starterBills: Bill[] = [
  makeBill('b1', 'CHE/25-2773989', '2025-09-08', 'Kishindas Auto Parts', { name: 'TATA ACE KIT', partNumber: 'PI/4333CPL STD', hsn: '84099191', quantity: 1, unit: 'Set', rate: 2240, discount: 2, gst: 18 }),
  makeBill('b2', 'INV-2025-082', '2025-09-05', 'Sri Lakshmi Traders', { name: 'XCENT/110 KAPP 1.2L PETROL ENGINE KIT', partNumber: 'XK-110-12', hsn: '84099191', quantity: 1, unit: 'Set', rate: 3540, discount: 2, gst: 18 }, '33AAKCS2087E1Z6', 'No. 18, Broadway, Chennai'),
  makeBill('b3', 'INV-2025-081', '2025-08-28', 'Vel Motors', { name: 'BRAKE SHOE SET - TATA ACE', partNumber: 'BS-TA-204', hsn: '87083000', quantity: 2, unit: 'Set', rate: 990, discount: 0, gst: 18 }, '33AACFV4132A1Z2', 'Mount Road, Chennai'),
  makeBill('b4', 'PI/4333CPL-219', '2025-08-12', 'Chennai Auto Corporation', { name: 'TATA ACE KIT', partNumber: 'PI/4333CPL STD', hsn: '84099191', quantity: 1, unit: 'Set', rate: 2100, discount: 2, gst: 18 }, '33AABCC1020B1Z5', 'Parrys Corner, Chennai'),
  makeBill('b5', 'RA/25-611', '2025-07-18', 'Vel Motors', { name: 'TATA ACE KIT', partNumber: 'PI/4333CPL STD', hsn: '84099191', quantity: 1, unit: 'Set', rate: 2050, discount: 0, gst: 18 }, '33AACFV4132A1Z2', 'Mount Road, Chennai'),
  makeBill('b6', 'RASP-0610', '2025-06-10', 'Ravi Auto Spares', { name: 'TATA ACE KIT', partNumber: 'PI/4333CPL STD', hsn: '84099191', quantity: 1, unit: 'Set', rate: 2180, discount: 2, gst: 18 }, '33AAHFR8203C1ZW', 'Poonamallee High Road, Chennai'),
  makeBill('b7', 'KAP-25-190', '2025-05-22', 'Kishindas Auto Parts', { name: 'OIL FILTER - TATA ACE', partNumber: 'OF-ACE-08', hsn: '84212300', quantity: 4, unit: 'Nos', rate: 245, discount: 0, gst: 18 }),
  makeBill('b8', 'SAT-25-044', '2025-04-16', 'Sri Lakshmi Traders', { name: 'CLUTCH PLATE ASSEMBLY', partNumber: 'CP-ACE-102', hsn: '87089300', quantity: 1, unit: 'Nos', rate: 1850, discount: 3, gst: 28 }, '33AAKCS2087E1Z6', 'No. 18, Broadway, Chennai'),
];

export type SpareTrackState = {
  bills: Bill[];
  addBill: (bill: Bill) => void;
};

export const useSpareTrackStore = create<SpareTrackState>()(
  persist(
    (set) => ({
      bills: starterBills,
      addBill: (bill) => set((state) => ({ bills: [bill, ...state.bills] })),
    }),
    { name: 'sparetrack-local-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const money = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;
export const billTotal = (bill: Bill) => bill.items.reduce((sum, item) => {
  const taxable = item.rate * item.quantity * (1 - item.discount / 100);
  return sum + taxable * (1 + item.gst / 100);
}, 0);
export const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const allParts = (bills: Bill[]) => {
  const map = new Map<string, { key: string; name: string; partNumber: string; hsn: string; history: { bill: Bill; item: BillItem }[] }>();
  bills.forEach((bill) => bill.items.forEach((item) => {
    const key = (item.partNumber || item.hsn || item.name).toLowerCase().replace(/\s+/g, '');
    const part = map.get(key) ?? { key, name: item.name, partNumber: item.partNumber, hsn: item.hsn, history: [] };
    part.history.push({ bill, item });
    map.set(key, part);
  }));
  return Array.from(map.values()).map((part) => ({ ...part, history: part.history.sort((a, b) => b.bill.invoiceDate.localeCompare(a.bill.invoiceDate)) }));
};
