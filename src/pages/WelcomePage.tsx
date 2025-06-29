import { useState } from 'react';
import { Users, GraduationCap, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const navigate = useNavigate();

    const roles = [
        {
            id: 'mentor',
            title: 'Masuk sebagai Mentor',
            description: 'Kelola absensi, setoran, dan pantau progres mahasantri bimbingan Anda.',
            icon: Users,
            features: [
                'Input Setoran & Absensi Mahasantri',
                'Pantau Log Muroja’ah Harian',
                'Lihat Rekapitulasi Mingguan Bimbingan',
                'Dapatkan Rekomendasi Jadwal AI',
                'Akses Penuh Data Mahasantri'
            ]
        },
        {
            id: 'mahasantri',
            title: 'Masuk sebagai Mahasantri',
            description: 'Akses dasbor pribadi, catat progres, dan dapatkan rekomendasi AI.',
            icon: GraduationCap,
            features: [
                'Catat Log Muroja’ah Harian',
                'Dapatkan Rekomendasi Jadwal AI',
                'Lihat Statistik & Rekap Pribadi',
                'Akses Rapor Digital'
            ]
        }
    ];

    const handleContinue = () => {
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-5 bg-gray-100">
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

            {/* Right side - Welcome Content */}
            <div className="flex flex-col lg:col-span-2 items-center justify-center p-8">
                <div className="w-full max-w-lg space-y-6 bg-white shadow-lg rounded-lg p-6">
                    <img
                        src="/mahadFullColor.svg"
                        alt="Logo Mahad"
                        width={170}
                        height={200}
                        className="mx-auto mb-4 mt-3"
                    />
                    <h1 className="text-4xl font-bold text-gray-800 text-center">Selamat Datang!</h1>
                    <p className="mt-2 text-lg text-gray-600 text-center">
                        Pilih peran Anda untuk melanjutkan ke sistem pembelajaran
                    </p>

                    {/* Role Selection Cards */}
                    <div className="space-y-3 mt-6">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;

                            return (
                                <div
                                    key={role.id}
                                    className={`cursor-pointer transition-all duration-200 ${isSelected ? 'transform scale-105' : ''
                                        }`}
                                    onClick={() => setSelectedRole(role.id)}
                                >
                                    <div className={`
                                        border-2 rounded-lg p-4 transition-all duration-200
                                        ${isSelected
                                            ? 'border-[#2E649C] bg-[#2E649C] text-white shadow-lg'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                        }
                                    `}>
                                        <div className="flex items-center space-x-3">
                                            <div className={`
                                                w-12 h-12 rounded-lg flex items-center justify-center
                                                ${isSelected
                                                    ? 'bg-white/20'
                                                    : 'bg-[#2E649C]'
                                                }
                                            `}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-base">{role.title}</h3>
                                                <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                                                    {role.description}
                                                </p>
                                            </div>

                                            <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isSelected ? 'transform rotate-90' : ''
                                                }`} />
                                        </div>

                                        {/* Features List */}
                                        {isSelected && (
                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                <div className="grid grid-cols-1 gap-1">
                                                    {role.features.map((feature, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <div className="w-1 h-1 bg-white/80 rounded-full"></div>
                                                            <span className="text-sm text-white/90">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole}
                        className={`
                            w-full py-2 rounded transition duration-300 ease-in-out transform hover:scale-105
                            ${selectedRole
                                ? 'bg-[#2E649C] hover:bg-[#275586] text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                        `}
                    >
                        {selectedRole ? 'Lanjutkan ke Login' : 'Pilih Peran Terlebih Dahulu'}
                    </button>

                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center pt-4 border-t border-gray-100">
                        <div className="w-16 h-16 mx-auto bg-[#2E649C] rounded-xl flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="mt-2 text-gray-500 text-sm">MTA Digital</div>
                    </div>
                </div>
            </div>
        </div>
    );
}