/**
 * scanner.js - Wrapper for html5-qrcode library
 */

class BarcodeScanner {
    constructor(containerId, onScanSuccessCallback) {
        this.containerId = containerId;
        this.onScanSuccessCallback = onScanSuccessCallback;
        this.scanner = null;
        this.isScanning = false;
    }

    /**
     * Start the camera and scanning process
     */
    start() {
        if (this.isScanning) return;

        // Configuration for html5-qrcode
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39
            ]
        };

        this.scanner = new Html5Qrcode(this.containerId);
        
        this.scanner.start(
            { facingMode: "environment" }, // prefer rear camera
            config,
            (decodedText, decodedResult) => {
                // On Success
                this.stop();
                this.onScanSuccessCallback(decodedText);
            },
            (errorMessage) => {
                // On Error (happens every frame it doesn't see a barcode, so we ignore it usually)
                // console.log(errorMessage);
            }
        ).then(() => {
            this.isScanning = true;
        }).catch((err) => {
            console.error("Failed to start scanner:", err);
            // Alert user to check permissions
            alert("Could not access camera. Please ensure you have granted camera permissions.");
        });
    }

    /**
     * Stop the camera
     */
    stop() {
        if (this.scanner && this.isScanning) {
            this.scanner.stop().then(() => {
                this.isScanning = false;
            }).catch((err) => {
                console.error("Failed to stop scanner:", err);
            });
        }
    }
}
