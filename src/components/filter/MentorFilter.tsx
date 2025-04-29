import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Mentor } from "@/types";

type MentorFilterProps = {
    mentors: Mentor[];
    handleMentorFilter: (e: string) => void;
    selectedMentorId?: string | null;
}

export default function MentorFilter({ mentors, handleMentorFilter, selectedMentorId }: MentorFilterProps) {
    const selectedMentor = mentors.find(mentor => mentor.id === parseInt(selectedMentorId || '')) || null;

    return (
        <div className="w-full sm:w-[300px]">
            <Select onValueChange={(e) => handleMentorFilter(e)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedMentor ? `${selectedMentor.gender === "L" ? "Ust. " : "Usth. "}${selectedMentor.nama}` : "Filter Mentor"} />
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