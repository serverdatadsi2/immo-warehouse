import { router } from '@inertiajs/react';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import {
    Blinds,
    Blocks,
    DatabaseZap,
    Delete,
    Download,
    FileChartColumn,
    FolderSync,
    HardDriveDownload,
    HardDriveUpload,
    Lasso,
    LassoSelect,
    Map,
    NotebookText,
    Package,
    QrCode,
    Search,
} from 'lucide-react';
import { ReactNode } from 'react';

type MenuItemParam = {
    key: string;
    icon: ReactNode;
    label: string;
    url?: string;
    children?: ItemType<MenuItemType>[];
};

function getMenuItem({ key, icon, label, url, children }: MenuItemParam): ItemType<MenuItemType> {
    return {
        key,
        icon,
        label,
        children,
        onClick: children
            ? undefined
            : () => {
                  router.get(url ?? '');
              },
    };
}

export const menuItems = [
    getMenuItem({
        key: 'master',
        icon: <Blinds size={20} />,
        label: 'Master',
        children: [
            getMenuItem({
                key: 'location-suggestions',
                icon: <Map size={17} />,
                label: 'Location Suggestions',
                url: '/master/location-suggestions',
            }),
        ],
    }),
    getMenuItem({
        key: 'search-product',
        icon: <Search size={17} />,
        label: 'Search Product',
        url: '/search-product',
    }),
    getMenuItem({
        key: 'inbounds',
        icon: <HardDriveDownload size={20} />,
        label: 'Inbounds',
        children: [
            getMenuItem({
                key: 'supplier',
                icon: <Download size={17} />,
                label: 'on Supplier',
                url: '/inbounds/supplier',
            }),
            getMenuItem({
                key: 'return-store',
                icon: <FolderSync size={17} />,
                label: 'Store Return',
                url: '/inbounds/return-store',
            }),
        ],
    }),
    getMenuItem({
        key: 'rfid-tagging',
        icon: <QrCode size={17} />,
        label: 'RFID Tagging',
        url: '/rfid-tagging',
    }),
    getMenuItem({
        key: 'remove-rfid',
        icon: <Delete size={17} />,
        label: 'Remove RFID',
        url: '/remove-rfid',
    }),
    getMenuItem({
        key: 'inbound-qc',
        icon: <LassoSelect size={17} />,
        label: 'Inbound QC',
        url: '/inbound-qc',
    }),
    getMenuItem({
        key: 'storage-warehouse',
        icon: <DatabaseZap size={17} />,
        label: 'Penyimpanan',
        url: '/storage-warehouse',
    }),
    getMenuItem({
        key: 'receiving-order',
        icon: <NotebookText size={17} />,
        label: 'Receiving Orders',
        url: '/receiving-order',
    }),
    getMenuItem({
        key: 'outbound-qc',
        icon: <Lasso size={17} />,
        label: 'Outbound QC',
        url: '/outbound-qc',
    }),
    getMenuItem({
        key: 'packing',
        icon: <Package size={17} />,
        label: 'Packing',
        url: '/packing',
    }),
    getMenuItem({
        key: 'staging',
        icon: <Blocks size={17} />,
        label: 'Staging',
        url: '/staging',
    }),
    getMenuItem({
        key: 'outbound',
        icon: <HardDriveUpload size={17} />,
        label: 'Outbound',
        url: '/outbound',
    }),
    getMenuItem({
        key: 'stock-opname',
        icon: <FileChartColumn size={17} />,
        label: 'Stock Opname',
        url: '/stock-opname',
    }),
];
