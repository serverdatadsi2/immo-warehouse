export interface Payment {
    id: string; //uuid
    total_amount: number;
    change_amount: number;
    paid_amount: number;
    status: string;
    note: string;

    created_at: string;
    updated_at: string;
    deleted_at: string;

    completed_at: string;
    transaction_number: string;
    tax_amount: number;
}
