import { MenuCounts } from '@/types/menu.type';
import { router } from '@inertiajs/react';
import { Badge, Typography } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import {
    Barcode,
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
    Package,
    QrCode,
    Search,
    Settings,
    ShieldPlus,
    ShoppingBag,
    ShoppingCart,
    Shuffle,
    Store,
    UserRoundCog,
} from 'lucide-react';
import { ReactNode } from 'react';

type MenuItemParam = {
    key: string;
    icon: ReactNode;
    label: ReactNode;
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

export function getMenuItems(
    data: MenuCounts | undefined,
    hasPermission: (permissionName: string) => boolean,
    hasAnyPermission: (permissionsArray: string[]) => boolean,
) {
    return [
        hasAnyPermission(['location_suggestion.view']) &&
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
        hasPermission('search_product') &&
            getMenuItem({
                key: 'search-product',
                icon: <Search size={17} />,
                label: 'Search Product',
                url: '/search-product',
            }),
        hasAnyPermission(['inbound.supplier.view', 'inbound.return.view']) &&
            getMenuItem({
                key: 'inbounds',
                icon: <HardDriveDownload size={20} />,
                label: 'Inbounds',
                children: [
                    hasPermission('inbound.supplier.view')
                        ? getMenuItem({
                              key: 'supplier',
                              icon: <Download size={17} />,
                              label: 'on Supplier',
                              url: '/inbounds/supplier',
                          })
                        : null,
                    hasPermission('inbound.return.view')
                        ? getMenuItem({
                              key: 'return-store',
                              icon: <FolderSync size={17} />,
                              label: 'Store Return',
                              url: '/inbounds/return-store',
                          })
                        : null,
                ],
            }),
        hasAnyPermission(['rfid.tagging', 'rfid.remove']) &&
            getMenuItem({
                key: 'rfid',
                icon: <Barcode size={20} />,
                label: 'RFID',
                children: [
                    hasPermission('rfid.tagging')
                        ? getMenuItem({
                              key: 'tagging',
                              icon: <QrCode size={17} />,
                              label: 'Tagging',
                              url: '/rfid/tagging',
                          })
                        : null,
                    hasPermission('rfid.remove')
                        ? getMenuItem({
                              key: 'remove',
                              icon: <Delete size={17} />,
                              label: 'Remove',
                              url: '/rfid/remove',
                          })
                        : null,
                ],
            }),
        hasPermission('inbound_qc.view') &&
            getMenuItem({
                key: 'inbound-qc',
                icon: <LassoSelect size={17} />,
                label: 'Inbound QC',
                url: '/inbound-qc',
            }),
        hasPermission('penyimpanan.view') &&
            getMenuItem({
                key: 'storage-warehouse',
                icon: <DatabaseZap size={17} />,
                label: 'Penyimpanan',
                url: '/storage-warehouse',
            }),
        hasPermission('stock_opname.view') &&
            getMenuItem({
                key: 'stock-opname',
                icon: <FileChartColumn size={17} />,
                label: 'Stock Opname',
                url: '/stock-opname',
            }),
        hasAnyPermission(['receiving_order.store.view', 'receiving_order.ecommerce.view']) &&
            getMenuItem({
                key: 'receiving-order',
                icon: (
                    <Badge count={data?.store_order ?? 0} size="small" color="volcano">
                        <Shuffle size={20} />
                    </Badge>
                ),
                label: 'Receiving Orders',

                children: [
                    hasPermission('receiving_order.store.view')
                        ? getMenuItem({
                              key: 'store-order',
                              icon: <Store size={17} />,
                              label: (
                                  <Badge
                                      count={data?.store_order ?? 0}
                                      size="small"
                                      offset={[15, 5]}
                                      color="volcano"
                                  >
                                      <Typography.Text className="!text-gray-200">
                                          Store{' '}
                                      </Typography.Text>
                                  </Badge>
                              ),

                              url: '/receiving-order/store-order',
                          })
                        : null,
                    hasPermission('receiving_order.ecommerce.view')
                        ? getMenuItem({
                              key: 'ecommerce-order',
                              icon: <ShoppingCart size={17} />,
                              label: (
                                  <Badge
                                      count={data?.ecommerce_order ?? 0}
                                      size="small"
                                      offset={[7, 5]}
                                      color="volcano"
                                  >
                                      <Typography.Text className="!text-gray-100">
                                          Ecommerce{' '}
                                      </Typography.Text>
                                  </Badge>
                              ),
                              url: '/receiving-order/ecommerce-order',
                          })
                        : null,
                ],
            }),
        hasPermission('outbound_qc.view') &&
            getMenuItem({
                key: 'outbound-qc',
                icon: <Lasso size={17} />,
                label: 'Outbound QC',
                url: '/outbound-qc',
            }),
        hasAnyPermission(['packing.store.view', 'packing.ecommerce.view']) &&
            getMenuItem({
                key: 'packing',
                icon: (
                    <Badge
                        count={Math.max(data?.store_packing || 0, data?.ecommerce_packing || 0)}
                        size="small"
                        color="volcano"
                    >
                        <Package size={20} />
                    </Badge>
                ),
                label: 'Packing',

                children: [
                    hasPermission('packing.store.view')
                        ? getMenuItem({
                              key: 'store',
                              icon: <Package size={17} />,
                              label: (
                                  <Badge
                                      count={data?.store_packing ?? 0}
                                      size="small"
                                      offset={[15, 5]}
                                      color="volcano"
                                  >
                                      <Typography.Text className="!text-gray-200">
                                          Store{' '}
                                      </Typography.Text>
                                  </Badge>
                              ),

                              url: '/packing/store',
                          })
                        : null,
                    hasPermission('packing.ecommerce.view')
                        ? getMenuItem({
                              key: 'ecommerce',
                              icon: <ShoppingBag size={17} />,
                              label: (
                                  <Badge
                                      count={data?.ecommerce_packing ?? 0}
                                      size="small"
                                      offset={[7, 5]}
                                      color="volcano"
                                  >
                                      <Typography.Text className="!text-gray-100">
                                          Ecommerce{' '}
                                      </Typography.Text>
                                  </Badge>
                              ),
                              url: '/packing/ecommerce',
                          })
                        : null,
                ],
            }),
        hasPermission('outbound.view') &&
            getMenuItem({
                key: 'outbound',
                icon: <HardDriveUpload size={17} />,
                label: 'Outbound',
                url: '/outbound',
            }),
        hasPermission('staging.view') &&
            getMenuItem({
                key: 'staging',
                icon: <Blocks size={17} />,
                label: 'Staging',
                url: '/staging',
            }),
        hasAnyPermission(['role.view', 'user.view']) &&
            getMenuItem({
                key: 'system',
                icon: <Settings size={20} />,
                label: 'System',
                children: [
                    hasPermission('role.view')
                        ? getMenuItem({
                              key: 'roles',
                              icon: <ShieldPlus size={17} />,
                              label: 'Role',
                              url: '/system/roles',
                          })
                        : null,
                    hasPermission('user.view')
                        ? getMenuItem({
                              key: 'users',
                              icon: <UserRoundCog size={17} />,
                              label: 'Users',
                              url: '/system/users',
                          })
                        : null,
                ],
            }),
    ].filter((i): i is ItemType<MenuItemType> => Boolean(i));
}
