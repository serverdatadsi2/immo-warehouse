import { Customer } from './customer.type';
import { Payment } from './payment.type';
import { Product } from './product.type';

export interface EcommerceOrder {
    id: string;
    order_number: string;
    user_id: string;
    customer_id: string;
    status: string;
    created_at: string; //date string
    shipping_address_id: string;
    handled_by_warehouse_id: string;
    handled_by_store_id: string;
}

export interface EcommerceOrderDetail {
    id: string;
    ecommerce_order_id: string;
    product_price_id: string;
    product_price: string;
    note: string;
    created_at: string;
    updated_at: string;
    product_id: string;
    quantity: string;
}

interface DetailWithRelation extends EcommerceOrderDetail {
    product: Product;
}

export interface EcommerceOrderWithDetailRelation extends EcommerceOrder {
    details: DetailWithRelation[];
    customer: Customer;
    payment: Payment;
}
