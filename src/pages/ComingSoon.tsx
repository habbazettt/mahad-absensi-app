import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function ComingSoon() {
    return (
        <div className="min-h-screen grid lg:grid-cols-5 bg-gray-100">
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
            {/* Left side with illustration */}
            <div className="relative hidden lg:flex lg:col-span-3 flex-col items-center justify-center p-8 bg-[var(--primary-1)] text-white">
                <div className="max-w-lg mx-auto text-center space-y-5">
                    <img
                        src="/MTADigitalLogo.svg"
                        alt="MTA Learning Management System"
                        width={300}
                        height={300}
                        className="mx-auto"
                    />
                    <h2 className="text-3xl font-medium font-jakarta">
                        MTA Learning Management System
                    </h2>
                    <p className="text-white/80 font-poppins">
                        Website Manajemen Absensi dan Hafalan Mahasantri Mahad Tahfidz Al-Qur'an UIN Bandung
                    </p>
                </div>
            </div>

            {/* Right side with Not Found message */}
            <div className="flex flex-col lg:col-span-2 items-center justify-center p-8">
                <div className="w-full max-w-lg space-y-6 text-center bg-white shadow-lg rounded-lg p-6">
                    <img
                        src="/comingsoon.svg"
                        alt="404 Not Found"
                        width={360}
                        height={460}
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-4xl font-bold text-gray-800">404 - Coming Soon</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Halaman ini sedang dalam tahap pengembangan
                    </p>
                    <Link to="/auth/login" className="mt-4">
                        <Button className="w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 rounded transition duration-300 ease-in-out transform hover:scale-105">
                            Login Kembali
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}