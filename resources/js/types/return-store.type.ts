import { Store } from './store.type';
import { User } from './user.type';

export interface ReturnStore {
    id: string;
    store_id: string;
    status: string;
    return_number: string;
    approved_by: string; //uuid user
    approved_at: string; //date string
    created_by: string; //uuid user
    note_store: string;
    note_warehouse: string;
    warehouse_id: string;
    shipped_at: string; //date string
    received_at: string; //date string
    rejected_at: string; //date string
    created_at: string;
    updated_at: string;
}

export interface ReturnStoreDetail {
    id: string;
    store_return_id: string;
    item_id: string;
    store_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ReturnStoreWithRelation extends ReturnStore {
    approved: User;
    store: Store;
}
export interface ReturnStoreWithDetailRelation extends ReturnStore {
    approved: User;
    store: Store;
    details: ReturnStoreDetail[];
}
