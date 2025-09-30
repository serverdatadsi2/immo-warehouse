export interface Inbound {
    id: string;
    supplier_id: string;
    received_by: string;
    warehouse_id: string;
    invoice_number: string;
    delivery_order_number: string;
    quantity_item: number;
    grand_total: number;

    received_date: string; // ISO date string

    created_at: string;
    updated_at: string;
}

export interface InboundDetail {
    id: string;
    warehouse_inbound_id: string;
    product_id: string;

    quantity: number;
    expired_date: string; // ISO date string
    note: string;

    created_at: string;
    updated_at: string;
}

export interface InboundDetailWithRelation extends InboundDetail {
    product_name: string;
    product_code: string;
    received_date: string; // ISO date string
    warehouse_id: string;
}
