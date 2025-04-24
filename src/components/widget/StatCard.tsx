import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    className?: string
    onClick?: () => void
    gradient?: "blue" | "purple" | "green"
}

export default function StatCard({
    title,
    value,
    icon,
    className,
    onClick,
    gradient = "blue"
}: StatCardProps) {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative rounded-xl bg-white shadow-lg p-6 overflow-hidden",
                "transition-all duration-300 cursor-pointer hover:shadow-xl",
                "group border border-transparent hover:border-primary/10",
                className
            )}
        >
            {/* Gradient Top Bar */}
            <div className={cn(
                "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
                gradient === "blue" && "from-blue-400 to-blue-600",
                gradient === "purple" && "from-purple-400 to-purple-600",
                gradient === "green" && "from-green-400 to-green-600"
            )} />

            {/* Animated Background Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-primary/10" />

            <div className="flex items-center gap-4">
                {/* Icon Container with Gradient */}
                <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    "bg-gradient-to-br text-white text-2xl",
                    gradient === "blue" && "from-blue-500 to-blue-600",
                    gradient === "purple" && "from-purple-500 to-purple-600",
                    gradient === "green" && "from-green-500 to-green-600",
                    "shadow-inner"
                )}>
                    {icon}
                </div>

                {/* Content */}
                <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                        {title}
                    </span>
                    <motion.span
                        initial={{ opacity: 0.8, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold tracking-tight text-primary"
                    >
                        {value}
                    </motion.span>
                </div>
            </div>

            {/* Animated Border Effect */}
            <div className="absolute inset-0 rounded-xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-primary/10 pointer-events-none" />
        </motion.div>
    )
}