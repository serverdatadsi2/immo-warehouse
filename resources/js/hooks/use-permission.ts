import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export const usePermission = () => {
    const { auth } = usePage<SharedData>().props;

    const hasPermission = (permissionName: string) => {
        if (!auth || !auth.permissions) {
            return false;
        }
        return auth.permissions.includes(permissionName);
    };

    const hasRole = (roleName: string) => {
        if (!auth || !auth.role) {
            return false;
        }
        return auth.role === roleName;
    };

    const hasAnyPermission = (permissionsArray: string[]) => {
        if (!auth || !auth.permissions) {
            return false;
        }
        return permissionsArray.some((permission) => auth.permissions.includes(permission));
    };

    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
    };
};
