import React, { createContext, useContext, useState } from 'react';

export interface RfidItem {
    rfid: string;
    product_name?: string;
    product_code?: string;
}

interface RemoveRfidContextValue {
    isScanning: boolean;
    setIsScanning: React.Dispatch<React.SetStateAction<boolean>>;
    scannedRfids: RfidItem[];
    setScannedRfids: React.Dispatch<React.SetStateAction<RfidItem[]>>;
    addScannedRfid: (data: RfidItem) => void;
}

const RemoveRfidContext = createContext<RemoveRfidContextValue | undefined>(undefined);

export function RemoveRfidProvider({ children }: { children: React.ReactNode }) {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scannedRfids, setScannedRfids] = useState<RfidItem[]>([]);

    const addScannedRfid = (data: RfidItem) => {
        // Cek apakah RFID sudah ada dalam list
        const existingRfid = scannedRfids.find((v) => v.rfid === data.rfid);
        if (!existingRfid) {
            setScannedRfids((prev) => [...prev, data]);
        }
    };

    return (
        <RemoveRfidContext.Provider
            value={{
                isScanning,
                setIsScanning,
                scannedRfids,
                setScannedRfids,
                addScannedRfid,
            }}
        >
            {children}
        </RemoveRfidContext.Provider>
    );
}

export function useRemoveRfid() {
    const ctx = useContext(RemoveRfidContext);
    if (!ctx) {
        throw new Error('useRemoveRfid must be used within RemoveRfidProvider');
    }
    return ctx;
}
