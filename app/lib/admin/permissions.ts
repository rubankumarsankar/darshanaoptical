import type { Role } from './types';

// ─── Permission Definitions ───────────────────────────────────────────────────

export interface PermissionMap {
  // Dashboard
  viewAdminDashboard: boolean;
  viewProfitData: boolean;

  // Customers
  addCustomer: boolean;
  editCustomer: boolean;
  deleteCustomer: boolean;
  viewCustomerHistory: boolean;

  // Eye Testing
  addEyeTest: boolean;
  editEyeTest: boolean;
  viewPrescription: boolean;
  printPrescription: boolean;

  // POS / Billing
  createInvoice: boolean;
  cancelInvoice: boolean;
  editCompletedInvoice: boolean;
  receivePayment: boolean;
  processRefund: boolean;

  // Discounts
  maxDiscountPercent: number;
  approveDiscount: boolean;

  // Products
  addProduct: boolean;
  editProduct: boolean;
  deleteProduct: boolean;
  viewPurchasePrice: boolean;
  editSellingPrice: boolean;

  // Inventory
  viewInventory: boolean;
  adjustStock: boolean;
  markDamaged: boolean;
  viewInventoryValue: boolean;

  // Suppliers & Purchases
  viewSuppliers: boolean;
  addSupplier: boolean;
  editSupplier: boolean;
  createPurchase: boolean;
  deletePurchase: boolean;

  // Expenses
  viewExpenses: boolean;
  addExpense: boolean;
  deleteExpense: boolean;

  // Reports
  viewSalesReport: boolean;
  viewProfitReport: boolean;
  viewInventoryReport: boolean;
  viewStaffReport: boolean;

  // Orders
  viewOrders: boolean;
  updateOrderStatus: boolean;

  // Staff
  viewStaff: boolean;
  addStaff: boolean;
  editStaff: boolean;
  disableStaff: boolean;
  resetStaffPassword: boolean;

  // Settings
  viewSettings: boolean;
  editSettings: boolean;
  editRoles: boolean;

  // Audit
  viewAuditLogs: boolean;
}

// ─── Role Permissions ─────────────────────────────────────────────────────────

export const PERMISSIONS: Record<Role, PermissionMap> = {
  admin: {
    viewAdminDashboard: true,
    viewProfitData: true,

    addCustomer: true,
    editCustomer: true,
    deleteCustomer: true,
    viewCustomerHistory: true,

    addEyeTest: true,
    editEyeTest: true,
    viewPrescription: true,
    printPrescription: true,

    createInvoice: true,
    cancelInvoice: true,
    editCompletedInvoice: true,
    receivePayment: true,
    processRefund: true,

    maxDiscountPercent: 100,
    approveDiscount: true,

    addProduct: true,
    editProduct: true,
    deleteProduct: true,
    viewPurchasePrice: true,
    editSellingPrice: true,

    viewInventory: true,
    adjustStock: true,
    markDamaged: true,
    viewInventoryValue: true,

    viewSuppliers: true,
    addSupplier: true,
    editSupplier: true,
    createPurchase: true,
    deletePurchase: true,

    viewExpenses: true,
    addExpense: true,
    deleteExpense: true,

    viewSalesReport: true,
    viewProfitReport: true,
    viewInventoryReport: true,
    viewStaffReport: true,

    viewOrders: true,
    updateOrderStatus: true,

    viewStaff: true,
    addStaff: true,
    editStaff: true,
    disableStaff: true,
    resetStaffPassword: true,

    viewSettings: true,
    editSettings: true,
    editRoles: true,

    viewAuditLogs: true,
  },

  manager: {
    viewAdminDashboard: true,
    viewProfitData: false,

    addCustomer: true,
    editCustomer: true,
    deleteCustomer: false,
    viewCustomerHistory: true,

    addEyeTest: true,
    editEyeTest: true,
    viewPrescription: true,
    printPrescription: true,

    createInvoice: true,
    cancelInvoice: true,
    editCompletedInvoice: false,
    receivePayment: true,
    processRefund: false,

    maxDiscountPercent: 15,
    approveDiscount: true,

    addProduct: true,
    editProduct: true,
    deleteProduct: false,
    viewPurchasePrice: true,
    editSellingPrice: true,

    viewInventory: true,
    adjustStock: true,
    markDamaged: true,
    viewInventoryValue: true,

    viewSuppliers: true,
    addSupplier: true,
    editSupplier: true,
    createPurchase: true,
    deletePurchase: false,

    viewExpenses: true,
    addExpense: true,
    deleteExpense: false,

    viewSalesReport: true,
    viewProfitReport: false,
    viewInventoryReport: true,
    viewStaffReport: false,

    viewOrders: true,
    updateOrderStatus: true,

    viewStaff: false,
    addStaff: false,
    editStaff: false,
    disableStaff: false,
    resetStaffPassword: false,

    viewSettings: false,
    editSettings: false,
    editRoles: false,

    viewAuditLogs: true,
  },

  staff: {
    viewAdminDashboard: false,
    viewProfitData: false,

    addCustomer: true,
    editCustomer: true,
    deleteCustomer: false,
    viewCustomerHistory: true,

    addEyeTest: true,
    editEyeTest: false,
    viewPrescription: true,
    printPrescription: true,

    createInvoice: true,
    cancelInvoice: false,
    editCompletedInvoice: false,
    receivePayment: true,
    processRefund: false,

    maxDiscountPercent: 5,
    approveDiscount: false,

    addProduct: false,
    editProduct: false,
    deleteProduct: false,
    viewPurchasePrice: false,
    editSellingPrice: false,

    viewInventory: true,
    adjustStock: false,
    markDamaged: true,
    viewInventoryValue: false,

    viewSuppliers: false,
    addSupplier: false,
    editSupplier: false,
    createPurchase: false,
    deletePurchase: false,

    viewExpenses: false,
    addExpense: false,
    deleteExpense: false,

    viewSalesReport: false,
    viewProfitReport: false,
    viewInventoryReport: false,
    viewStaffReport: false,

    viewOrders: true,
    updateOrderStatus: true,

    viewStaff: false,
    addStaff: false,
    editStaff: false,
    disableStaff: false,
    resetStaffPassword: false,

    viewSettings: false,
    editSettings: false,
    editRoles: false,

    viewAuditLogs: false,
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export function can(role: Role, permission: keyof PermissionMap): boolean {
  return !!PERMISSIONS[role][permission];
}

export function getMaxDiscount(role: Role): number {
  return PERMISSIONS[role].maxDiscountPercent;
}
