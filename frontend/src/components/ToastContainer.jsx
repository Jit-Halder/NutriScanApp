import React from 'react';

export default function ToastContainer({ toasts }) {
    return (
        <div id="toast-container" className="toast-container">
            {toasts.map(toast => {
                let iconClass = "ph-fill ph-info";
                let iconColor = "var(--primary)";
                if (toast.type === 'error') {
                    iconClass = "ph-fill ph-x-circle";
                    iconColor = "var(--score-e)";
                } else if (toast.type === 'success') {
                    iconClass = "ph-fill ph-check-circle";
                    iconColor = "var(--score-a)";
                }

                return (
                    <div 
                        key={toast.id} 
                        className={`toast toast-${toast.type} ${toast.fading ? 'fade-out' : ''}`}
                    >
                        <i className={iconClass} style={{ fontSize: '1.2rem', color: iconColor }}></i>
                        <span>{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
}
