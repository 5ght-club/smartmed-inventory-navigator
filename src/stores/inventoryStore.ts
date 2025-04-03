
import { create } from 'zustand';

// Define the inventory item type
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  expiryDate: string;
  unitPrice: number | string; // Support both number and string types to prevent conversion errors
  lastUpdated?: string;
  supplier?: string;
  location?: string;
}

// Sample data to use if no CSV is uploaded
const sampleInventory: InventoryItem[] = [
  {
    id: "MED001",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    currentStock: 120,
    minimumStock: 50,
    expiryDate: "2024-12-31",
    unitPrice: 0.15,
    supplier: "PharmaCorp",
    location: "Shelf A1"
  },
  {
    id: "MED002",
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    currentStock: 45,
    minimumStock: 60,
    expiryDate: "2024-10-15",
    unitPrice: 0.45,
    supplier: "MediSource",
    location: "Shelf B2"
  },
  {
    id: "MED003",
    name: "Ibuprofen 200mg",
    category: "Anti-inflammatory",
    currentStock: 85,
    minimumStock: 40,
    expiryDate: "2025-01-20",
    unitPrice: 0.20,
    supplier: "PharmaCorp",
    location: "Shelf A2"
  },
  {
    id: "MED004",
    name: "Loratadine 10mg",
    category: "Antihistamine",
    currentStock: 65,
    minimumStock: 30,
    expiryDate: "2024-11-05",
    unitPrice: 0.30,
    supplier: "AllergyCare",
    location: "Shelf C1"
  },
  {
    id: "MED005",
    name: "Omeprazole 20mg",
    category: "Gastric",
    currentStock: 95,
    minimumStock: 40,
    expiryDate: "2024-09-30",
    unitPrice: 0.40,
    supplier: "DigestHealth",
    location: "Shelf D2"
  },
  {
    id: "MED006",
    name: "Metformin 500mg",
    category: "Diabetes",
    currentStock: 110,
    minimumStock: 60,
    expiryDate: "2025-02-28",
    unitPrice: 0.25,
    supplier: "GlucoHelp",
    location: "Shelf E1"
  },
  {
    id: "MED007",
    name: "Aspirin 75mg",
    category: "Anti-platelet",
    currentStock: 75,
    minimumStock: 50,
    expiryDate: "2024-08-15",
    unitPrice: 0.10,
    supplier: "HeartCare",
    location: "Shelf A3"
  },
  {
    id: "MED008",
    name: "Lisinopril 10mg",
    category: "Hypertension",
    currentStock: 50,
    minimumStock: 40,
    expiryDate: "2024-12-10",
    unitPrice: 0.35,
    supplier: "CardioHealth",
    location: "Shelf F2"
  },
  {
    id: "MED009",
    name: "Atorvastatin 20mg",
    category: "Cholesterol",
    currentStock: 85,
    minimumStock: 40,
    expiryDate: "2025-03-20",
    unitPrice: 0.55,
    supplier: "LipidCare",
    location: "Shelf G1"
  },
  {
    id: "MED010",
    name: "Levothyroxine 50mcg",
    category: "Thyroid",
    currentStock: 35,
    minimumStock: 30,
    expiryDate: "2024-11-25",
    unitPrice: 0.40,
    supplier: "ThyroSource",
    location: "Shelf H3"
  }
];

// Define the inventory store
interface InventoryState {
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, item: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  searchResults: InventoryItem[];
  setSearchResults: (items: InventoryItem[]) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  inventory: sampleInventory,
  searchResults: [],
  setInventory: (items) => set({ inventory: items }),
  addItem: (item) => set((state) => ({ 
    inventory: [...state.inventory, item] 
  })),
  updateItem: (id, updatedItem) => set((state) => ({
    inventory: state.inventory.map((item) => 
      item.id === id ? { ...item, ...updatedItem } : item
    )
  })),
  removeItem: (id) => set((state) => ({
    inventory: state.inventory.filter((item) => item.id !== id)
  })),
  setSearchResults: (items) => set({ searchResults: items }),
}));
