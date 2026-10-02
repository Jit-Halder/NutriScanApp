import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function ScannerView({ onScanSuccess, onBack, showToast }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        const readerId = "reader";
        const readerEl = document.getElementById(readerId);
        if (!readerEl) return;

        const containerWidth = readerEl.clientWidth || 300;
        const qrboxWidth = Math.min(250, Math.floor(containerWidth * 0.8));
        const qrboxHeight = Math.min(150, Math.floor(qrboxWidth * 0.6));

        const config = {
            fps: 10,
            qrbox: { width: qrboxWidth, height: qrboxHeight },
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39
            ]
        };

        const html5Qrcode = new Html5Qrcode(readerId);
        scannerRef.current = html5Qrcode;

        let isScanning = true;

        const successCallback = (decodedText) => {
            if (!isScanning) return;
            isScanning = false;
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                    onScanSuccess(decodedText);
                }).catch(err => {
                    console.error("Error stopping scanner", err);
                    onScanSuccess(decodedText);
                });
            } else {
                onScanSuccess(decodedText);
            }
        };

        const errorCallback = () => {
            // Frame scan errors can be safely ignored
        };

        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                html5Qrcode.start(
                    { facingMode: "environment" },
                    config,
                    successCallback,
                    errorCallback
                ).catch(() => {
                    // Fallback to first available camera
                    html5Qrcode.start(
                        devices[0].id,
                        config,
                        successCallback,
                        errorCallback
                    ).catch(err => {
                        console.error("Camera access failed", err);
                        showToast("Could not access camera. Please grant camera permissions.", "error");
                    });
                });
            } else {
                showToast("No camera devices found.", "error");
            }
        }).catch(err => {
            console.error("Camera enumeration failed", err);
            showToast("Could not access camera. Ensure HTTPS or localhost is used.", "error");
        });

        return () => {
            isScanning = false;
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().then(() => {
                        scannerRef.current.clear();
                    }).catch(() => {});
                } catch (e) {}
            }
        };
    }, [onScanSuccess, showToast]);

    const handleBackClick = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                    onBack();
                }).catch(() => onBack());
            } catch (e) {
                onBack();
            }
        } else {
            onBack();
        }
    };

    return (
        <div id="scanner-view" className="view active">
            <div className="glass-card scanner-card">
                <div className="card-title-row">
                    <h2><i className="ph-duotone ph-camera" style={{ color: 'var(--primary)' }}></i> Scan Barcode</h2>
                    <button onClick={handleBackClick} className="btn btn-secondary btn-small">
                        <i className="ph ph-arrow-left"></i> Back
                    </button>
                </div>
                <div id="reader-container">
                    <div id="reader"></div>
                </div>
                <p className="scan-hint">
                    <i className="ph ph-info"></i>
                    Point your camera at the barcode on the product packaging.
                </p>
            </div>
        </div>
    );
}
