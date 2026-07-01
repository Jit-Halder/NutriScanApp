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
        
        const successCallback = (decodedText, decodedResult) => {
            if (!this.isScanning) return;
            this.stop();
            this.onScanSuccessCallback(decodedText);
        };
        const errorCallback = (errorMessage) => {
            // Ignore frame errors
        };

        // Try to get cameras first
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                // Try environment (rear) camera first
                this.scanner.start(
                    { facingMode: "environment" },
                    config,
                    successCallback,
                    errorCallback
                ).then(() => {
                    this.isScanning = true;
                }).catch((err) => {
                    console.warn("Failed to start environment camera, trying fallback...", err);
                    // Fallback to the first available camera (usually webcam on PC)
                    this.scanner.start(
                        devices[0].id,
                        config,
                        successCallback,
                        errorCallback
                    ).then(() => {
                        this.isScanning = true;
                    }).catch((err2) => {
                        console.error("Camera fallback failed:", err2);
                        if(window.showToast) window.showToast("Could not access camera. Please ensure you have granted camera permissions.", "error");
                        else alert("Could not access camera. Please ensure you have granted camera permissions.");
                    });
                });
            } else {
                if(window.showToast) window.showToast("No cameras found on this device.", "error");
                else alert("No cameras found on this device.");
            }
        }).catch(err => {
            console.error("Error enumerating cameras:", err);
            if(window.showToast) window.showToast("Could not access cameras. Ensure you are using HTTPS (or localhost) and have granted permissions.", "error");
            else alert("Could not access cameras. Ensure you are using HTTPS (or localhost) and have granted permissions.");
        });
    }

    /**
     * Stop the camera
     */
    stop() {
        if (this.scanner && this.isScanning) {
            this.isScanning = false;
            try {
                this.scanner.stop().then(() => {
                    this.scanner.clear(); // Clear the video element
                }).catch((err) => {
                    console.error("Failed to stop scanner:", err);
                });
            } catch (e) {
                console.error("Error calling scanner.stop():", e);
            }
        }
    }
}
