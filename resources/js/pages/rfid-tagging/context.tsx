import { InboundDetailWithRelation } from '@/types/inbound.type';
import { Item } from '@/types/item.type';
import React, { createContext, useContext, useState } from 'react';

interface RfidTaggingContextValue {
    scanning: boolean;
    setScanning: React.Dispatch<React.SetStateAction<boolean>>;
    selected: InboundDetailWithRelation | undefined;
    setSelected: React.Dispatch<React.SetStateAction<InboundDetailWithRelation | undefined>>;
    data: Item[] | undefined;
    setData: React.Dispatch<React.SetStateAction<Item[] | undefined>>;
}

const RfidTaggingContext = createContext<RfidTaggingContextValue | undefined>(undefined);

export function RfidTaggingProvider({ children }: { children: React.ReactNode }) {
    const [scanning, setScanning] = useState<boolean>(false);
    const [selected, setSelected] = useState<InboundDetailWithRelation>();
    const [data, setData] = useState<Item[]>();

    return (
        <RfidTaggingContext.Provider
            value={{ scanning, setScanning, selected, setSelected, data, setData }}
        >
            {children}
        </RfidTaggingContext.Provider>
    );
}

export function useRfidTagging() {
    const ctx = useContext(RfidTaggingContext);
    if (!ctx) {
        throw new Error('useRfidTagging must be used within RfidTaggingProvider');
    }
    return ctx;
}
