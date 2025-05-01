import { Download } from "lucide-react";
import { Button } from "./ui/button";

export const CsvExportButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    className="w-full sm:w-[140px] bg-green-500 hover:bg-green-400 text-white hover:text-white cursor-pointer font-semibold"
    onClick={onClick}
  >
    <Download />
    Export ke CSV
  </Button>
);