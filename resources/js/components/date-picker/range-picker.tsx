import { DownOutlined } from '@ant-design/icons';
import { DatePicker, Dropdown, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const { RangePicker } = DatePicker;

interface SelectRangePickerProps {
    value?: [Dayjs, Dayjs] | null;
    onChange?: (dates: [Dayjs, Dayjs] | null) => void;
    style?: React.CSSProperties;
    placeholder?: string;
}

const getTodayRange = (): [Dayjs, Dayjs] => [dayjs().startOf('day'), dayjs().endOf('day')];

const selectStyleBase: React.CSSProperties = {
    height: 32,
    padding: '4px 11px',
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
    color: 'rgba(0, 0, 0, 0.88)',
    fontSize: 14,
};

const defaultPlaceholder = 'Select range';

const SelectRangePicker: React.FC<SelectRangePickerProps> = ({
    value,
    onChange,
    style,
    placeholder = defaultPlaceholder,
}) => {
    const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(() => {
        return value !== undefined ? (value ?? getTodayRange()) : getTodayRange();
    });

    const [visible, setVisible] = useState(false);
    const [panelVisible, setPanelVisible] = useState(false);
    const [hoveringDates, setHoveringDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    useEffect(() => {
        if (value !== undefined) {
            setDates(value ?? null);
        }
    }, [value]);

    const handlePresetClick = useCallback(
        (days: number) => {
            let startDay: Dayjs;
            const endDay: Dayjs = dayjs().endOf('day');

            if (days === 1) {
                startDay = dayjs().startOf('day');
            } else {
                startDay = dayjs()
                    .subtract(days - 1, 'day')
                    .startOf('day');
            }

            const newDates: [Dayjs, Dayjs] = [startDay, endDay];
            setDates(newDates);
            onChange?.(newDates);
            setVisible(false);
            setPanelVisible(false);
        },
        [onChange],
    );

    const disabledDate = useCallback(
        (current: Dayjs) => {
            if (!current) {
                return false;
            }

            const isAfterToday = current.isAfter(dayjs().endOf('day'), 'millisecond');
            if (isAfterToday) {
                return true;
            }

            if (hoveringDates && hoveringDates[0] && !hoveringDates[1]) {
                const startDay = hoveringDates[0].startOf('day');
                const diff = Math.abs(current.diff(startDay, 'day'));

                if (diff >= 7) {
                    return true;
                }
            }
            return false;
        },
        [hoveringDates],
    );

    const displayValue = useMemo(() => {
        if (!dates) return placeholder;
        const [start, end] = dates.sort((a, b) => a.valueOf() - b.valueOf());
        return `${start.format('DD-MM-YYYY')} ~ ${end.format('DD-MM-YYYY')}`;
    }, [dates, placeholder]);

    const selectStyle = useMemo(() => ({ ...selectStyleBase, ...style }), [style]);

    const CustomDatePickerItem = (
        <div
            style={{ position: 'relative', overflow: 'hidden', padding: '5px 12px' }}
            onClick={(e) => {
                e.stopPropagation();
                setPanelVisible(true);
            }}
        >
            <div>Customize Range</div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <RangePicker
                    open={panelVisible}
                    disabledDate={disabledDate}
                    onOpenChange={(open) => {
                        if (!open) {
                            setHoveringDates(null);
                        }
                    }}
                    styles={{
                        root: {
                            pointerEvents: 'none',
                            opacity: 0,
                            position: 'absolute',
                            bottom: 0,
                            insetInlineStart: 0,
                            width: '100%',
                            height: '100%',
                        },
                    }}
                    onChange={(ranges) => {
                        if (ranges && ranges[0] && ranges[1]) {
                            const [start, end] = ranges
                                .filter((d): d is Dayjs => d !== null)
                                .sort((a, b) => a.valueOf() - b.valueOf());

                            const newDates: [Dayjs, Dayjs] = [
                                start.startOf('day'),
                                end.endOf('day'),
                            ];

                            setDates(newDates);
                            onChange?.(newDates);
                        } else {
                            setDates(null);
                            onChange?.(null);
                        }

                        setVisible(false);
                        setPanelVisible(false);
                        setHoveringDates(null);
                    }}
                    onCalendarChange={(val) => {
                        setHoveringDates(val);
                    }}
                    value={dates}
                />
            </div>
        </div>
    );

    return (
        <Dropdown
            arrow
            open={visible}
            trigger={['click']}
            destroyOnHidden
            onOpenChange={(open) => {
                setVisible(open);
                if (!open) {
                    setPanelVisible(false);
                    setHoveringDates(null);
                }
            }}
            menu={{
                items: [
                    { key: '1', label: 'Today', onClick: () => handlePresetClick(1) },
                    { key: '2', label: 'Last 2 Days', onClick: () => handlePresetClick(2) },
                    { key: '3', label: 'Last 3 Days', onClick: () => handlePresetClick(3) },
                    { type: 'divider' },
                    { key: 'custom-date', label: CustomDatePickerItem, className: 'custom-item' },
                ],
            }}
        >
            <div style={selectStyle}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span
                        style={{
                            color: dates ? 'rgba(0, 0, 0, 0.88)' : 'rgba(0, 0, 0, 0.45)',
                        }}
                    >
                        {displayValue}
                    </span>
                    <DownOutlined
                        style={{
                            transition: 'transform 0.2s',
                            transform: visible ? 'rotate(180deg)' : 'rotate(0deg)',
                            fontSize: 12,
                            color: 'rgba(0, 0, 0, 0.45)',
                        }}
                    />
                </Space>
            </div>
        </Dropdown>
    );
};

export default SelectRangePicker;
