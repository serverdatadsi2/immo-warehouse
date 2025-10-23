import { Permission } from './permission.type';

export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
    created_at: string;
}
