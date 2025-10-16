import { Item } from './item.type';
import { Location } from './location-suggestion.type';
import { Product } from './product.type';
import { RFIDTag } from './rfid-tag.types';
import { User } from './user.type';

export interface StockOpname {
    id: string;
    warehouse_id: string;
    user_id: string;
    code: string;
    location_id: string;
    status: string;
    completed_at: string; // ISO date string

    created_at: string;
    updated_at: string;
}

export interface StockOpnameDetail {
    id: string;
    warehouse_stock_opname_id: string;
    rfid_tag_id: number;
    status: number;
    scanned_at: number;

    created_at: string;
    updated_at: string;
}

export interface StockOpnameWithRelation extends StockOpname {
    location: Location;
    user: User;
}

interface ItemWithRelation extends Item {
    product: Product;
}

interface RfidTag extends RFIDTag {
    item: ItemWithRelation;
}

export interface StockOpnameDetailWithRelation extends StockOpname {
    rfid_tag: RfidTag;
    user: User;
}

export interface Params {
    search?: string;
    status?: '' | 'in_progerss' | 'draft' | 'complated';
    dateRange?: [string, string]; // [isoDateString, isoDateString]
}
