import { Courier } from './courier.type';
import { Customer } from './customer.type';
import { Product } from './product.type';
import { RFIDTag } from './rfid-tag.types';
import { ShippingMethod } from './shipping-method.type';
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
    outbound_type: 'store' | 'ecommerce' | 'destroy' | 'transfer' | 'return_to_supplier';

    created_at: string;
    updated_at: string;
    released_at: string;
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
    ecommerce_order: EcommerceOrder;
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
    ecommerce_order: EcommerceOrder;
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

interface Region {
    id: string; // UUID
    code: string;
    name: string;
}

export interface ShippingAddress {
    id: string; // UUID
    customer_id: string; // UUID
    name: string;
    phone: string;
    detail: string;
    other_detail: string | null; // Asumsi bisa null
    is_main: boolean;
    province_code: string;
    regency_code: string;
    district_code: string;
    village_code: string;
    geom: string; // Tipe data geometri (WKT)
    created_at: string; // ISO 8601 string (Date)

    provincy: Region; // Nama properti asli Anda adalah 'provincy'
    regency: Region;
    district: Region;
    village: Region;
}

interface EcommerceOrder {
    id: string; // UUID
    shipping_address_id: string; // UUID
    customer_id: string; // UUID

    customer: Customer;
    shipping_address: ShippingAddress;
    shipping_method: ShippingMethod;
}
