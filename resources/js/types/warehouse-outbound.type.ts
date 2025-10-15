import { Courier } from './courier.type';
import { Product } from './product.type';
import { RFIDTag } from './rfid-tag.types';
import { StoreOrder } from './store-order.type';
import { Store } from './store.type';
import { User } from './user.type';
import { Warehouse } from './warehouse.type';

export interface Outbound {
    id: string;
    warehouse_id: string;
    user_id: string;
    invoice_number: string;
    delivery_order_number: string;
    quantity_item: number;
    courier_id: string;

    shipment_date: string; // ISO date string
    order_id: string; //join to ecommerce_orders if order_ref ecommerce || join to store_orders if order_ref store
    order_number: string; //get data to order_id
    order_ref: 'store' | 'ecommerce';

    created_at: string;
    updated_at: string;
}

interface OutboundDetail {
    warehouse_outbound_id: string;
    item_id: string;
}

export interface OutboundDetailWithRelation extends OutboundDetail {
    product: Product;
    rfid: RFIDTag;
}

export interface OutboundWithRelations extends Outbound {
    warehouse: Warehouse;
    user: User;
    courier: Courier;
}
export interface OutboundWithDetailRelations extends OutboundWithRelations {
    details: OutboundDetailWithRelation;
}

interface StoreOrderWithRelation extends StoreOrder {
    store: Store;
}

export interface HeaderOutboundPrint extends OutboundWithRelations {
    store_order: StoreOrderWithRelation;
}

export interface OutboundDetailPrint {
    header: HeaderOutboundPrint;
    details: {
        product_code: string;
        product_name: string;
        product_id: string;
        quantity: number;
        unit_name: string;
    }[];
}
