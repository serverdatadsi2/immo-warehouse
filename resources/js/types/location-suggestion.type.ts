export interface LocationSuggestion {
    id: string;
    product_id: string;
    location_id: string;
    product_name?: string;
    product_code?: string;
    layer_name?: string;
    layer_code?: string;
    rack_name?: string;
    rack_code?: string;
    room_name?: string;
    room_code?: string;
    room_id?: string;
    rack_id?: string;
}

export interface Location {
    id: string;
    name: string;
    code: string;
    type: 'room' | 'rack' | 'layer';
    location_parent_id?: string;
    parent?: Location;
    children?: Location[];
} 