export interface Item {
    id: string;
    product_id: string;
    current_location_id: string;
    current_condition_id: string;
    warehouse_inbound_detail_id: string;
    expired_date: string;
    rfid_tag_id: string;
    rfid_installed_by: string;
    status: 'warehouse_stock' | 'in_delivery' | 'store_stock' | 'sold';
}

export interface GetItems {
    product_id: string;
    warehouse_inbound_detail_id: string;
    expired_date: string;
}

export interface InsertItems {
    product_id: string;
    warehouse_inbound_detail_id: string;
    expired_date: string;
    quantity: number;
}
