export interface EcommercePayment {
    id: string; //uuid
    user_id: string;
    customer_id: string;
    ecommerce_order_id: string;
    payment_id: string;
}
