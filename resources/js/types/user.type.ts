import { Warehouse } from './warehouse.type';

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    warehouse: Warehouse;
    created_at: string;
}
