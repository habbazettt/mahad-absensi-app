import { useState, useEffect } from 'react';

interface UserProfile {
    id: number;
    nama: string;
    nim?: string;
    email?: string;
    gender: string;
    jurusan?: string;
    mentor_id?: number;
    mahasantri_count?: number;
    user_type: "mentor" | "mahasantri";
    is_data_murojaah_filled: boolean;
}
export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Gagal membaca data pengguna dari local storage", error);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateUser = (newUserData: UserProfile | null) => {
        setUser(newUserData);
        if (newUserData) {
            localStorage.setItem('user', JSON.stringify(newUserData));
        } else {
            localStorage.removeItem('user');
        }
    };

    return { user, isLoading, updateUser };
};