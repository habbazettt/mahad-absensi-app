export const getInitials = (nama: string): string => {
    const nameParts = nama.split(" ");
    const initials = nameParts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');

    return initials;
}
