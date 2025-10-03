import { Button, Card } from 'antd';
import jsQR from 'jsqr';
import React, { useCallback, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

interface QRCodeScannerProps {
    facingMode: 'user' | 'environment';
    onScan: (barcodeValue: string) => void;
    onSwitchCamera: () => void;
    isActive: boolean;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
    facingMode,
    onScan,
    onSwitchCamera,
    isActive,
}) => {
    const webcamRef = useRef<Webcam>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const video = (webcamRef.current as any).video as HTMLVideoElement | null;
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        onScan(code.data);
                    }
                }
            }
        }
    }, [onScan]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(capture, 500);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, capture]);

    return (
        <div className="flex justify-center">
            <Card className="max-w-4xl mb-6 shadow-xl">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-gray-200">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode }}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <Button onClick={onSwitchCamera} className="mb-4">
                        Switch Camera
                    </Button>

                    <p className="mb-4 text-center text-gray-600">
                        Arahkan kamera ke QR code RFID untuk memindai secara otomatis
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default QRCodeScanner;
