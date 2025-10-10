export interface Storage {
    id: string;
    product_name: string;
    product_code: string;
    product_id: string;
    status: string;
    quantity: number;
    layer_name: string;
    layer_code: string;
    rack_name: string;
    rack_code: string;
    room_name: string;
    room_code: string;
    warehouse_name: string;
    warehouse_id: string;
    condition_name: string;
}

export interface UnsignProductLocation {
    product_name: string;
    product_code: string;
    inbound_date: string; //iso date string
    quantity: number;
    product_id: string;
    qc_type: string;
}
