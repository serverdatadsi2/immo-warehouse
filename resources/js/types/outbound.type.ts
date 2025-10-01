export interface Outbound {
    id: string;
    warehouse_id: string;
    user_id: string;
    invoice_number: string;
    delivery_order_number: string;
    quantity_item: number;
    grand_total: number;
    courier_id: string;

    shipment_date: string; // ISO date string
    order_id: string; //join to ecommerce_orders if order_ref ecommerce || join to store_orders if order_ref store
    order_ref: 'store' | 'ecommerce';

    created_at: string;
    updated_at: string;
}

export interface OutboundDetail {
    id: string;
    warehouse_outbound_id: string;
    item_id: string;
    // product_name: string;

    created_at: string;
    updated_at: string;
}

// export interface OutboundDetailWithRelation extends OutboundDetail {
//     product_name: string;
//     product_code: string;
//     received_date: string; // ISO date string
//     warehouse_id: string;
// }
