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
