// import { AppLayout } from '@/layouts/app-layout';
// import { Head } from '@inertiajs/react';
// import { Button, Card, Input, List, Space, Tag, Typography } from 'antd';
// import { useEffect, useRef, useState } from 'react';
// import { Pannel } from './components/pannel';

// const { Title, Text } = Typography;

// export default function InboundQC_RFID_UI() {
//     const [goodItems, setGoodItems] = useState([]);
//     const [badItems, setBadItems] = useState([]);
//     const [activeLabel, setActiveLabel] = useState(null);
//     const [scanning, setScanning] = useState(false);
//     const [scanValue, setScanValue] = useState('');
//     const scanInputRef = useRef(null);
//     const [log, setLog] = useState([]);

//     const productNames = [
//         'Serum Brightening',
//         'Face Wash Gentle',
//         'Moisturizer Hydrating',
//         'Lip Balm Natural',
//         'Sunscreen SPF 50',
//         'Hair Oil Smooth',
//         'Toner Refresh',
//         'Body Lotion Glow',
//     ];

//     function getRandomProductName() {
//         return productNames[Math.floor(Math.random() * productNames.length)];
//     }

//     function pushLog(message) {
//         setLog((l) => [{ ts: new Date().toLocaleTimeString(), message }, ...l].slice(0, 40));
//     }

//     useEffect(() => {
//         if (scanInputRef.current) scanInputRef.current.focus();
//     }, []);

//     useEffect(() => {
//         if (!scanning || !activeLabel) return;
//         const interval = setInterval(() => {
//             const randomRFID = `RFID-${Math.floor(1000 + Math.random() * 9000)}`;
//             const newItem = { rfid: randomRFID, name: getRandomProductName() };
//             assignToLabel(newItem, activeLabel);
//         }, 3000);
//         return () => clearInterval(interval);
//     }, [scanning, activeLabel]);

//     function assignToLabel(item, label) {
//         if (!item || !label) return;
//         const target = { ...item, labelled_at: new Date().toISOString(), label };
//         if (label === 'good') {
//             setGoodItems((prev) => [target, ...prev]);
//             pushLog(`${item.name} (RFID ${item.rfid}) → GOOD`);
//         } else if (label === 'bad') {
//             setBadItems((prev) => [target, ...prev]);
//             pushLog(`${item.name} (RFID ${item.rfid}) → BAD`);
//         }
//     }

//     function handleScanSubmit(e) {
//         e.preventDefault();
//         const rfid = scanValue.trim();
//         if (!rfid) return;
//         if (!activeLabel) {
//             pushLog('Pilih labeling mode terlebih dahulu!');
//             return;
//         }
//         if (!scanning) {
//             pushLog("Klik 'Start Scan' untuk memulai pemindaian.");
//             return;
//         }
//         const newItem = { rfid, name: getRandomProductName() };
//         assignToLabel(newItem, activeLabel);
//         pushLog(`${newItem.name} (RFID ${rfid}) ditambahkan secara manual ke ${activeLabel}`);
//         setScanValue('');
//     }

//     return (
//         <AppLayout navBarTitle="Inbound QC">
//             <Head title="RFID Tagging" />
//             {/* <Text type="secondary">
//                 Pilih mode labeling terlebih dahulu, lalu klik Start Scan untuk memulai pemindaian.
//             </Text> */}
//             <Pannel
//                 leftPanel={
//                     <Space direction="vertical" size={16} style={{ flex: 1 }}>
//                         {/* Manual Scan */}
//                         <Card title="RFID Manual Scan">
//                             <form onSubmit={handleScanSubmit}>
//                                 <Space.Compact style={{ width: '100%' }}>
//                                     <Input
//                                         ref={scanInputRef}
//                                         value={scanValue}
//                                         onChange={(e) => setScanValue(e.target.value)}
//                                         placeholder="Pindai RFID lalu Enter"
//                                         disabled={!scanning}
//                                     />
//                                     <Button type="primary" htmlType="submit" disabled={!scanning}>
//                                         Submit
//                                     </Button>
//                                 </Space.Compact>
//                             </form>
//                         </Card>

//                         {/* Labeling Mode + Start Scan */}
//                         <Card title="Labeling Mode">
//                             <Space>
//                                 <Button
//                                     type={activeLabel === 'good' ? 'primary' : 'default'}
//                                     onClick={() => setActiveLabel('good')}
//                                 >
//                                     Good
//                                 </Button>
//                                 <Button
//                                     type={activeLabel === 'bad' ? 'primary' : 'default'}
//                                     danger
//                                     onClick={() => setActiveLabel('bad')}
//                                 >
//                                     Bad
//                                 </Button>
//                                 <Button
//                                     type={scanning ? 'primary' : 'dashed'}
//                                     danger={scanning}
//                                     onClick={() => setScanning((s) => !s)}
//                                 >
//                                     {scanning ? 'Stop Scan' : 'Start Scan'}
//                                 </Button>
//                             </Space>
//                             <div style={{ marginTop: 12 }}>
//                                 <Text type="secondary">
//                                     Mode aktif:{' '}
//                                     {activeLabel ? (
//                                         <Tag color={activeLabel === 'good' ? 'green' : 'red'}>
//                                             {activeLabel}
//                                         </Tag>
//                                     ) : (
//                                         <Tag color="default">Belum dipilih</Tag>
//                                     )}
//                                 </Text>
//                                 <br />
//                                 <Text type="secondary">
//                                     Status Scan:{' '}
//                                     {scanning ? (
//                                         <Tag color="blue">Aktif</Tag>
//                                     ) : (
//                                         <Tag color="default">Nonaktif</Tag>
//                                     )}
//                                 </Text>
//                             </div>
//                         </Card>
//                     </Space>
//                     // <LeftPannel />
//                 }
//                 rightPannel={
//                     <Space align="start" className="w-full">
//                         <Space direction="vertical">
//                             <Space className="w-full" style={{ flex: 2 }}>
//                                 <Card size="small" className="p-10">
//                                     <p>{`Good Label (${goodItems.length})`}</p>
//                                     <List
//                                         dataSource={goodItems}
//                                         locale={{ emptyText: 'Belum ada item' }}
//                                         renderItem={(it) => (
//                                             <List.Item>
//                                                 <List.Item.Meta
//                                                     title={<Text strong>{it.name}</Text>}
//                                                     description={
//                                                         <Text type="secondary">
//                                                             RFID: {it.rfid}
//                                                         </Text>
//                                                     }
//                                                 />
//                                             </List.Item>
//                                         )}
//                                     />
//                                 </Card>

//                                 {/* <Card title={`Bad Label (${badItems.length})`}>
//                                     <List
//                                         dataSource={badItems}
//                                         locale={{ emptyText: 'Belum ada item' }}
//                                         renderItem={(it) => (
//                                             <List.Item>
//                                                 <List.Item.Meta
//                                                     title={<Text strong>{it.name}</Text>}
//                                                     description={
//                                                         <Text type="secondary">
//                                                             RFID: {it.rfid}
//                                                         </Text>
//                                                     }
//                                                 />
//                                             </List.Item>
//                                         )}
//                                     />
//                                 </Card> */}
//                             </Space>
//                             <Card title="Operator Log">
//                                 <List
//                                     size="small"
//                                     dataSource={log}
//                                     locale={{ emptyText: 'No activity yet.' }}
//                                     renderItem={(l) => (
//                                         <List.Item>
//                                             <Text type="secondary">[{l.ts}]</Text>&nbsp;{l.message}
//                                         </List.Item>
//                                     )}
//                                 />
//                             </Card>
//                         </Space>
//                     </Space>
//                 }
//             />
//         </AppLayout>
//     );
// }
