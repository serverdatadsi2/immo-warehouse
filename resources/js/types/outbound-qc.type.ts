import { Product } from './product.type';

interface StoreOrder {
    id: string;
    order_number: string;
    store_id: string;
    warehouse_id: string;
    requested_at: string; // ISO date string
    approved_at: string; // ISO date string
    approved_by: string;
    approved_name: string;
    status: string;
    quantity_item: number;
    grand_total: number;
}

interface StoreOrderDetail {
    id: string;
    store_order_id: string;
    product_id: string;
    product: Product;
    requested_qty: number;
    approved_qty: number;
    note: string;
}

export interface Params {
    search?: string;
}

export interface StoreOrderWithRelatons extends StoreOrder {
    store: {
        id: string;
        name: string;
    };
    details: StoreOrderDetail[];
}
