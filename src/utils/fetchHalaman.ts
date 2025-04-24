import { MahasantriWithHafalan } from "@/types"

export const fetchHafalanByMentor = async (mentorId: string, token: string): Promise<MahasantriWithHafalan[]> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/hafalan/mentor/${mentorId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const result = await response.json()

    if (!result.status) throw new Error(result.message || "Fetch failed")

    return result.data.mahasantriList
}
