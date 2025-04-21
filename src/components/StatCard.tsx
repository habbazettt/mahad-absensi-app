import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    className?: string
}

export default function StatCard({ title, value, icon, className }: StatCardProps) {
    return (
        <div className={cn("rounded-xl bg-white shadow p-4 flex items-center gap-4", className)}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary text-xl">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{title}</span>
                <span className="text-2xl font-semibold">{value}</span>
            </div>
        </div>
    )
}
