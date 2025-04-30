import { CsvColumnConfig } from "@/types";

export const exportToCSV = <T extends object>(
    data: T[],
    columns: CsvColumnConfig<T>[],
    filename: string
) => {
    const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');

    const rows = data.map(item => {
        return columns.map(col => {
            const value = item[col.key];
            const formattedValue = col.format ? col.format(value) : value;
            const escaped = String(formattedValue).replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};