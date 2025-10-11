import { Badge, Card } from 'antd';
import { Radio, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
    readerId: string;
    status: 'active' | 'inactive';
    onScan?: (tagId: string) => void;
}

export const RFIDScanner = ({ readerId, status = 'active', onScan }: Props) => {
    const [lastTag, setLastTag] = useState<string>('');

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`p-3 rounded-lg ${status === 'active' ? 'bg-blue-200' : 'bg-red-100'}`}
                    >
                        <Radio className={status === 'active' ? 'text-blue-500' : 'text-red-400'} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">RFID Reader</h3>
                        <p className="text-sm text-muted-foreground">{readerId}</p>
                    </div>
                </div>
                <Badge className="gap-1.5">
                    {status === 'active' ? (
                        <div className="flex flex-col items-end">
                            <Wifi size={18} className="text-green-600" />
                            Aktif
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <WifiOff size={18} className="text-red-600" />
                            Tidak Aktif
                        </div>
                    )}
                </Badge>
            </div>

            {status === 'active' && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Scan Terakhir:</span>
                        <span className="text-sm font-mono text-foreground">
                            {lastTag || 'Menunggu...'}
                        </span>
                    </div>
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-success animate-pulse w-1/3"></div>
                    </div>
                </div>
            )}
        </Card>
    );
};
