import { Product } from './product.type';
import { RFIDTag } from './rfid-tag.types';
import { Warehouse } from './warehouse.type';

export interface Staging {
    id: string;
    warehouse_id: string;
    quantity: number;
    name: string;
    rfid_reader_id: string;
    released_at: string; //Iso Date string
}

interface StagingDetail {
    warehouse_staging_outbound_id: string;
    product_id: string;
    rfid_tag_id: string;
    item_id: string;
}

export interface StagingDetailWithRelation extends StagingDetail {
    product: Product;
    rfid: RFIDTag;
}

export interface StagingWithRelations extends Staging {
    warehouse: Warehouse;
}
export interface StagingWithDetailRelations extends StagingWithRelations {
    details: StagingDetailWithRelation;
}
