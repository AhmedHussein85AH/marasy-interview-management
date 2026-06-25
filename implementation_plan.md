# Expansion of Permissions System

This plan outlines the steps to add new specific permissions and enforce them across the "Twins Warehouse Management System".

## User Review Required

> [!IMPORTANT]
> - **New Action Permissions**: I will add `editData` and `deleteData` permissions. If a user is NOT an admin and doesn't have these permissions, they won't be able to edit or delete any records across the system.
> - **Granular Module Permissions**: Permissions like `reports` will be split/supplemented by `financialDashboard` and `debts` to allow finer control.
> - **Default Admin**: The `admin` user will continue to have all permissions by default.

## Proposed Changes

### [Component Name] Core Storage & Types

#### [MODIFY] [types.ts](file:///d:/sites/Archive/warehouse/solik%20backup/%D8%A7%D9%84%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC/%D8%A7%D8%AE%D8%B1%20%D8%AA%D8%AD%D8%AF%D9%8A%D8%AB%2004-04-2026/%D8%AA%D9%88%D9%8A%D9%86%D8%B2-%D8%A7%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D9%85%D8%AE%D8%A7%D8%B2%D9%86/src/lib/storage/types.ts)
- Update `PermissionModule` type to include:
    - `sales`, `purchases` (for Invoices)
    - `financialDashboard`
    - `debts`
    - `companySettings`
    - `expiryAlerts`
    - `editData` (Global edit permission)
    - `deleteData` (Global delete permission)
- Update `ALL_PERMISSIONS` array.
- Update `PERMISSION_LABELS` with Arabic translations for the new items.

---

### [Component Name] Dashboard & Navigation

#### [MODIFY] [Index.tsx](file:///d:/sites/Archive/warehouse/solik%20backup/%D8%A7%D9%84%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC/%D8%A7%D8%AE%D8%B1%20%D8%AA%D8%AD%D8%AF%D9%8A%D8%AB%2004-04-2026/%D8%AA%D9%88%D9%8A%D9%86%D8%B2-%D8%A7%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D9%85%D8%AE%D8%A7%D8%B2%D9%86/src/pages/Index.tsx)
- Update `allMenuItems` to use the new specific permissions:
    - Purchases -> `purchases`
    - Sales -> `sales`
    - Financial Dashboard -> `financialDashboard`
    - Debts Manager -> `debts`
    - Expiry Alerts -> `expiryAlerts`
    - Company Settings -> `companySettings`
    - Activity Log -> `auditLog`

---

### [Component Name] User Management

#### [MODIFY] [UsersModal.tsx](file:///d:/sites/Archive/warehouse/solik%20backup/%D8%A7%D9%84%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC/%D8%A7%D8%AE%D8%B1%20%D8%AA%D8%AD%D8%AF%D9%8A%D8%AB%2004-04-2026/%D8%AA%D9%88%D9%8A%D9%86%D8%B2-%D8%A7%D8%AF%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D9%85%D8%AE%D8%A7%D8%B2%D9%86/src/components/modals/UsersModal.tsx)
- Ensure the checkbox grid handles the expanded permission list (it should be automatic since it maps over `ALL_PERMISSIONS`, but I'll double-check labels).

---

### [Component Name] Enforcement in Modals

I will update the following main modals to respect `editData` and `deleteData` permissions:

#### [MODIFY] ProductsModal, CustomersModal, SuppliersModal, CategoriesModal, WarehousesModal
- Hide/Disable "Add", "Edit", and "Delete" buttons if the user lacks the required action permission.
- Use `hasPermission(currentUser, 'editData')` and `hasPermission(currentUser, 'deleteData')`.

#### [MODIFY] IncomingModal, OutgoingModal, InvoicesModal, DebtsModal
- Apply similar logic for transaction editing and deletion.

## Open Questions

1. **Specific Edit Permissions?**: Do you want a separate "Edit" permission *per module* (e.g., `editProducts`, `editCustomers`) or is a global `editData` and `deleteData` sufficient for all pages?
2. **Existing Data**: For existing non-admin users, I will need to migrate their permission arrays to include the new keys if they previously had the "parent" permission (e.g., if they had `reports`, they should probably get `financialDashboard` and `debts` initially).

## Verification Plan

### Automated Tests
- N/A (Manual verification is more suitable for UI permissions).

### Manual Verification
1. Log in as `admin`.
2. Create a new user with limited permissions (e.g., only "Products" and NO "Edit/Delete").
3. Log in as the new user.
4. Verify that only the "Products" card is visible on the dashboard.
5. Open "Products" and verify that "Add Product" button is hidden and "Edit/Delete" actions in the table are disabled or hidden.
6. Repeat for other modules like "Sales" and "Debts".
