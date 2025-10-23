export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    roles: string[];
    warehouses: Record<string, string>;
    ecommerce_access: boolean;
    wms_access: boolean;
    backoffice_access: boolean;
    store_access: boolean;
    created_at: string;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
    created_at: string;
}

export interface Permission {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
}

export interface Warehouse {
    id: string;
    name: string;
}