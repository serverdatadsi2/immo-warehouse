// Detail stok per lokasi (ruangan, rak, layer)
export interface LocationStock {
    warehouse_name: string | null;
    warehouse_code: string | null;
    room_name: string | null;
    room_code: string | null;
    rack_name: string | null;
    rack_code: string | null;
    layer_name: string | null;
    layer_code: string | null;
    quantity: number;
}

// Header produk (ringkasan)
export interface ProductStock {
    product_name: string;
    product_code: string;
    product_unit: string;
    grand_total: number;
    locations: LocationStock[];
}
