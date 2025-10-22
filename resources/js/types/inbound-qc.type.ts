import { Dayjs } from 'dayjs';

export interface FilterQc {
    status: string;
    search: string;
    dateRange: [Dayjs, Dayjs] | null;
    page: number;
}

export interface InboundQC {
    rfid: string;
    product_id: string;
    product_name: string;
    warehouse_id: string;
    warehouse_name: string;
    performed_by: string;
    scan_time: string; // ISO date string
    status: string;
    condition: string;
    room_name: string;
    layer_name: string;
    rack_name: string;
}

interface HeightBadProduct {
    product_name: string;
    product_id: string;
    percentage: number;
}

export interface InboundQcSummary {
    grand_total: number;
    good_qty: number;
    bad_dty: number;
    highestBadProduct: HeightBadProduct;
}

export interface SimplePaginationMeta {
    current_page: number;
    from: number | null;
    to: number | null;
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}

export interface MonitoringInboundQc {
    pagination: SimplePaginationMeta;
    data: InboundQC[];
}
