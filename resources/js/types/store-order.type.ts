export interface StoreOrder {
    id: string;
    order_number: string;
    store_id: string;
    warehouse_id: string;
    status: string;
    requested_at: string; //date string
    date: string; //date string
    approved_at: string; //date string
    approved_by: string; //uuid user approve
}
