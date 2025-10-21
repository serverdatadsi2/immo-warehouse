import { ShippingAddress } from '@/types/warehouse-outbound.type';

export function appendQueryString(key: string, value: string): string {
    // Get current path and query string (without origin)
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const searchParams = new URLSearchParams(url.search);

    // Set or update the query param
    searchParams.set(key, value);

    // Return path + query string (if any)
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
}

export function removeQueryString(key: string): string {
    // Get current path and query string (without origin)
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const searchParams = new URLSearchParams(url.search);

    // Delete the query param
    searchParams.delete(key);

    // Return path + remaining query string (if any)
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
}

export function getQueryString(key: string): string | undefined {
    // Get current path and query string (without origin)
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    // Set or update the query param
    return searchParams.get(key) ?? undefined;
}

export function formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function formatFullAddress(addressData: ShippingAddress): string {
    if (!addressData) {
        return 'Alamat tidak tersedia.';
    }

    const { name, phone, detail, other_detail, village, district, regency, provincy } = addressData;

    let fullDetail = detail;
    if (other_detail) {
        fullDetail += (fullDetail ? ', ' : '') + other_detail;
    }

    const regionParts: string[] = [];

    if (village?.name) {
        regionParts.push(village.name);
    }
    if (district?.name) {
        regionParts.push(district.name);
    }
    if (regency?.name) {
        regionParts.push(regency.name);
    }
    if (provincy?.name) {
        regionParts.push(provincy.name);
    }

    const fullAddress = [fullDetail, ...regionParts]
        .filter((part) => part) // Hapus elemen kosong/null
        .join(', '); // Gabungkan dengan koma dan spasi

    const finalAddressParts = [
        `${name} (${phone})`, // Baris 1: Nama dan Telepon
        fullAddress, // Baris 2: Detail Alamat dan Wilayah
    ].filter((part) => part);

    return finalAddressParts.join('\n');
}
