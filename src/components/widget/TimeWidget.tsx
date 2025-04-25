import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
    Clock,
    Sunrise,
    Sunset,
    AlarmClock,
    Sun,
    Moon,
    Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Types untuk response API
interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asar: string;
    Maghrib: string;
    Isha: string;
}

interface TimeWidgetProps {
    className?: string;
}

const TimeWidget = ({ className }: TimeWidgetProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [halaqohStatus, setHalaqohStatus] = useState<"shubuh" | "isya" | null>(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Konversi waktu sholat ke jam desimal
    const parsePrayerTime = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours + minutes / 60;
    };

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            try {
                const today = new Date();
                const response = await fetch(
                    `https://api.aladhan.com/v1/timingsByCity/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?city=Bandung&country=Indonesia&method=5`
                );

                if (!response.ok) throw new Error("Gagal mengambil data waktu sholat");

                const data = await response.json();
                const timings = data.data.timings;

                setPrayerTimes({
                    Fajr: timings.Fajr,
                    Sunrise: timings.Sunrise,
                    Dhuhr: timings.Dhuhr,
                    Asar: timings.Asr,
                    Maghrib: timings.Maghrib,
                    Isha: timings.Isha
                });

            } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        };

        fetchPrayerTimes();
    }, []);

    useEffect(() => {
        if (!prayerTimes) return;

        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            const currentHour = now.getHours() + now.getMinutes() / 60;

            // Konversi waktu sholat ke desimal
            const fajrStart = parsePrayerTime(prayerTimes.Fajr);
            const ishaStart = parsePrayerTime(prayerTimes.Isha);

            // Update halaqoh status
            const isShubuh = currentHour >= fajrStart && currentHour < parsePrayerTime(prayerTimes.Sunrise);
            const isIsya = currentHour >= ishaStart && currentHour < (ishaStart + 1.75);

            setHalaqohStatus(isShubuh ? "shubuh" : isIsya ? "isya" : null);

            // Hitung progress halaqoh
            if (isShubuh) {
                const duration = parsePrayerTime(prayerTimes.Sunrise) - fajrStart;
                const elapsed = currentHour - fajrStart;
                setProgress((elapsed / duration) * 100);
            } else if (isIsya) {
                const duration = 1.75;
                const elapsed = currentHour - ishaStart;
                setProgress((elapsed / duration) * 100);
            } else {
                setProgress(0);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [prayerTimes]);

    const getHalaqohDetails = () => {
        if (!prayerTimes) return null;

        if (halaqohStatus === "shubuh") {
            return {
                title: "Halaqoh Shubuh",
                time: `${prayerTimes.Fajr} - ${prayerTimes.Sunrise}`,
                icon: <Sunrise className="h-6 w-6 text-blue-600" />,
                color: "bg-blue-100/80",
                textColor: "text-blue-800"
            };
        }
        if (halaqohStatus === "isya") {
            return {
                title: "Halaqoh Isya'",
                time: `${prayerTimes.Isha} - ${(parsePrayerTime(prayerTimes.Isha) + 1.75).toFixed(2).replace('.', ':')}`,
                icon: <Sunset className="h-6 w-6 text-purple-600" />,
                color: "bg-purple-100/80",
                textColor: "text-purple-800"
            };
        }
        return {
            title: "Aktifitas Reguler",
            time: currentTime.getHours() >= 19 ? "Waktu Istirahat" : "Waktu Kegiatan Kuliah",
            icon: currentTime.getHours() >= 18 ?
                <Moon className="h-6 w-6 text-amber-600" /> :
                <Sun className="h-6 w-6 text-amber-600" />,
            color: "bg-amber-100/80",
            textColor: "text-amber-800"
        };
    };

    const formatProgressTime = () => {
        if (!halaqohStatus || !prayerTimes) return "";
        const remaining = ((100 - progress) / 100) *
            (halaqohStatus === "shubuh" ?
                (parsePrayerTime(prayerTimes.Sunrise) - parsePrayerTime(prayerTimes.Fajr)) :
                1.75);

        const hours = Math.floor(remaining);
        const minutes = Math.round((remaining - hours) * 60);
        return `${hours} jam ${minutes} menit tersisa`;
    };

    if (loading) {
        return (
            <Card className="p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        );
    }

    if (error || !prayerTimes) {
        return (
            <Card className="p-6 text-destructive">
                ⚠️ {error || "Gagal memuat data waktu sholat"}
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${className}`}
        >
            <Card className="p-6 shadow-lg relative overflow-hidden  dark:from-slate-800 dark:to-slate-900">
                <div className="flex flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                    Detail Waktu
                                </span>
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1.5">
                                Kab. Bandung • {currentTime.toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <span className="text-4xl font-bold tabular-nums">
                            {currentTime.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>


                    {/* Halaqoh Status */}
                    {getHalaqohDetails() && (
                        <motion.div
                            className={cn(
                                "rounded-xl p-4 flex items-start gap-4 transition-colors",
                                getHalaqohDetails()?.color
                            )}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                {getHalaqohDetails()?.icon}
                            </div>

                            <div className="flex-1">
                                <h3 className={cn(
                                    "text-lg font-semibold mb-1",
                                    getHalaqohDetails()?.textColor
                                )}>
                                    {getHalaqohDetails()?.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {getHalaqohDetails()?.time}
                                </p>

                                {halaqohStatus && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <AlarmClock className="h-4 w-4" />
                                            <span>{formatProgressTime()}</span>
                                        </div>
                                        <Progress
                                            value={progress}
                                            className={cn(
                                                "h-2 bg-gray-200/50 dark:bg-input",
                                                halaqohStatus === "shubuh" ? "progress-blue" : "progress-purple"
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Jadwal Sholat */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <Sunrise className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="font-medium">Shubuh</p>
                                <p className="text-muted-foreground">{prayerTimes.Fajr}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <Sun className="h-5 w-5 text-amber-500" />
                            <div>
                                <p className="font-medium">Dhuhr</p>
                                <p className="text-muted-foreground">{prayerTimes.Dhuhr}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <Sun className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="font-medium">Asr</p>
                                <p className="text-muted-foreground">{prayerTimes.Asar}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <Sunset className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="font-medium">Maghrib</p>
                                <p className="text-muted-foreground">{prayerTimes.Maghrib}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <Moon className="h-5 w-5 text-slate-600" />
                            <div>
                                <p className="font-medium">Isya</p>
                                <p className="text-muted-foreground">{prayerTimes.Isha}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default TimeWidget;