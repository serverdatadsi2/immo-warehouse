import { Outbound } from './warehouse-outbound.type';
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
    warehouse_outbound_id: string;
}

export interface StagingDetailWithRelation extends StagingDetail {
    outbound: Outbound;
}

export interface StagingWithRelations extends Staging {
    warehouse: Warehouse;
}
export interface StagingWithDetailRelations extends StagingWithRelations {
    details: StagingDetailWithRelation;
}
