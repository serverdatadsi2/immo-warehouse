export interface LowStock {
    product_id: string;
    product_name: string;
    product_code: string;
    condition_status: string;
    unit_name: string;
    product_category: string;
    stock_barrier: number;
    tolearnce_persentage: string; //string decimal
    stock: number;
    status_level: string;
}

export interface ChartType {
    date: string; //string date
    inbound: number;
    outbound: string;
}

export interface SlowMoving {
    product_id: string;
    product_name: string;
    product_code: string;
    quantity: number;
    room_name: string;
    rack_name: string;
    layer_name: string;
    status: string;
}

export type DeadStock = SlowMoving;
