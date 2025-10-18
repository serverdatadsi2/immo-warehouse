import {
    DeleteOutlined,
    ExclamationCircleFilled,
    PlusOutlined,
    PrinterOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { Button, ButtonProps, Modal } from 'antd';
import { Upload } from 'lucide-react';

export function SaveButton({ onClick, ...props }: Props) {
    return (
        <Button {...props} onClick={onClick} icon={<SaveOutlined />} type="primary">
            Save
        </Button>
    );
}

export function DeleteButton({ onClick, ...props }: Props) {
    const showDeleteConfirm = () => {
        Modal.confirm({
            title: 'Delete',
            icon: <ExclamationCircleFilled />,
            content: 'Are you sure to delete this Data?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            centered: true,
            onOk() {
                onClick();
            },
            // onCancel() {
            //       console.log('Cancel');
            // },
        });
    };
    return (
        // <Popconfirm
        //     title="Delete"
        //     description="Are you sure to delete this Data?"
        //     onConfirm={onClick}
        // >
        <Button onClick={showDeleteConfirm} {...props} icon={<DeleteOutlined />} danger>
            Delete
        </Button>
        // </Popconfirm>
    );
}

// export function CloseButton({ onClick, ...props }: Props) {
//     useHotkeys('escape', () => onClick(), { scopes: ['crud-form-modal'], enableOnFormTags: true });
//     return (
//         <Tooltip title="(esc)">
//             <Button {...props} onClick={onClick} icon={<CloseOutlined />} />
//         </Tooltip>
//     );
// }

export function AddButton({ onClick, ...props }: Props) {
    return (
        <Button {...props} onClick={onClick} icon={<PlusOutlined />} type="primary">
            Add
        </Button>
    );
}

export function PrintButton({ onClick, ...props }: Props) {
    return (
        <Button
            {...props}
            onClick={onClick}
            icon={<PrinterOutlined />}
            variant="solid"
            // color="green"
            type="primary"
        >
            Print
        </Button>
    );
}

export function PostJurnalButton({ onClick, ...props }: Props) {
    return (
        <Button
            {...props}
            onClick={onClick}
            icon={<Upload size={16} />}
            variant="solid"
            color="blue"
            type="primary"
        >
            Post to Journal
        </Button>
    );
}

// export function BackButton({ backUrl }: { backUrl: string }) {
//     const handleBack = useCallback(() => {
//         router.get(backUrl);
//     }, [backUrl]);

//     return (
//         <Button
//             size="large"
//             style={{ fontSize: '1.1rem' }}
//             type="text"
//             icon={<CaretLeftFilled />}
//             onClick={handleBack}
//         />
//     );
// }

type Props = Omit<ButtonProps, 'onClick'> & {
    onClick: () => void;
};
