import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Mentor } from "@/types";

type MentorFilterProps = {
    mentors: Mentor[];
    handleMentorFilter: (e: string) => void;
}

export default function MentorFilter({ mentors, handleMentorFilter }: MentorFilterProps) {
    return (
        <div className="w-full sm:w-[280px]">
            <Select onValueChange={(e) => handleMentorFilter(e)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter Mentor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Mentor</SelectItem>
                    {mentors.map((mentor) => (
                        <SelectItem
                            key={mentor.id}
                            value={String(mentor.id)}
                        >
                            {mentor.gender === "L" ? "Ust. " : "Usth. "}
                            {mentor.nama}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}