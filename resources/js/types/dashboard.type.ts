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
