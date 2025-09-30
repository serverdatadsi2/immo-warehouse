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
