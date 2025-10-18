<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class InboundQCResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'rfid' => (string) $this->rfid,
            'product_id' => (string) $this->product_id,
            'product_name' => $this->product_name,
            'warehouse_id' => (string) $this->warehouse_id,
            'warehouse_name' => $this->warehouse_name,
            'performed_by' => $this->performed_by,
            // Mengubah ke ISO string untuk scan_time
            'scan_time' => $this->performed_at,
            // Menggunakan condition_name sebagai status
            'status' => $this->condition_name === 'Good' ? 'Good' : 'Bad',
            // Menggunakan condition_name sebagai condition
            'condition' => $this->condition_name,
            'layer_name' => $this->layer_name,
            'rack_name' => $this->rack_name,
            'room_name' => $this->room_name
        ];
    }
}
