// SystemMessageContext.tsx
import { message } from 'antd';
import React, { createContext, useContext } from 'react';

type ActionType = 'save' | 'update' | 'delete' | 'create';
type StatusType = 'success' | 'error';

type ShowParams = {
    action: ActionType;
    model: string;
    status: StatusType;
    reason?: string;
};

const SystemMessageContext = createContext<(params: ShowParams) => void>(() => {});

export const SystemMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    const show = ({ action, model, status, reason }: ShowParams) => {
        const verb = getVerb(action);
        const content = status === 'success' ? `Successfully ${verb} ${model}.` : `Failed to ${action} ${model}${reason ? `: ${reason}` : '.'}`;
        messageApi[status](content);
    };

    return (
        <SystemMessageContext.Provider value={show}>
            {contextHolder}
            {children}
        </SystemMessageContext.Provider>
    );
};

function getVerb(action: ActionType) {
    switch (action) {
        case 'save':
        case 'create':
            return 'saved';
        case 'update':
            return 'updated';
        case 'delete':
            return 'deleted';
        default:
            return action;
    }
}

export const useSystemMessage = () => useContext(SystemMessageContext);
