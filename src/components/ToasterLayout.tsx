import { Toaster } from "react-hot-toast";

export default function ToasterLayout() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 5000,
                style: {
                    maxWidth: '500px',
                    padding: '12px 16px',
                },
                success: {
                    style: {
                        border: '1px solid #10B981',
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                    },
                },
                error: {
                    style: {
                        border: '1px solid #EF4444',
                        backgroundColor: '#FEF2F2',
                        color: '#991B1B',
                    },
                },
            }}
        />
    )
}