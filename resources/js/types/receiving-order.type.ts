export interface ReceivingOrder {
    id: string;
    order_number: string;
    store_id: string;
    store_name: string;
    warehouse_id: string;
    requested_at: string; // ISO date string
    approved_at: string; // ISO date string
    approved_by: string;
    approved_name: string;
    status: string;
    invoice_number: string;
    delivery_order_number: string;
    quantity_item: number;
    grand_total: number;

    created_at: string;
    updated_at: string;
}

export interface ReceivingOrderDetail {
    id: string;
    store_order_id: string;
    requested_qty: number;
    appoved_qty: number;
    note: number;
    created_at: string;
    updated_at: string;
}

export interface ReceivingEcommerceOrder {
    id: string;
    order_number: string;
    customer_id: string;
    customer_name: string;
    user_id: string;
    shipping_address_id: string;
    completed_at: string;
    status: string;
    handled_by_warehouse_id: string;
    handled_by_store_id: string;
    quantity_item: number;

    created_at: string;
    updated_at: string;
}

export interface ReceivingEcommerceOrderDetail {
    id: string;
    quantity: number;
    note: number;
    created_at: string;
    updated_at: string;
}

export interface Params {
    search?: string;
    status?: 'approved' | 'received' | 'processing' | 'shipped';
    dateRange?: [string, string]; // [isoDateString, isoDateString]
}
