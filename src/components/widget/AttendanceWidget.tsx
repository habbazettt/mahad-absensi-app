import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AttendanceWidgetProps {
    total: number;
    hadir: number;
    izin: number;
    alpa: number;
    onViewDetails: () => void;
}

export default function AttendanceWidget({
    total,
    hadir,
    izin,
    alpa,
    onViewDetails
}: AttendanceWidgetProps) {
    return (
        <motion.div
            className={cn(
                "relative rounded-xl bg-white shadow-lg p-6 overflow-hidden",
                "transition-all duration-300 cursor-pointer hover:shadow-xl",
                "group border border-transparent hover:border-primary/10"
            )}
        >
            {/* Gradient Top Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Absensi Hari Ini</h3>
                    <p className="text-sm text-muted-foreground">
                        Total {total} absensi tercatat
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewDetails}
                    className="text-primary hover:text-primary-600"
                >
                    Lihat Detail
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{hadir}</div>
                    <div className="text-sm text-green-800">Hadir</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{izin}</div>
                    <div className="text-sm text-yellow-800">Izin</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{alpa}</div>
                    <div className="text-sm text-red-800">Alpa</div>
                </div>
            </div>

            {/* Animated Border Effect */}
            <div className="absolute inset-0 rounded-xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-primary/10 pointer-events-none" />
        </motion.div>
    );
}