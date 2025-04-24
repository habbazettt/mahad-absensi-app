import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NavigateFunction } from "react-router-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTanggalIndo = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export const handleLogout = (navigate: NavigateFunction) => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");

  setTimeout(() => {
    navigate("/auth/mentor/login", { replace: true });
  }, 100);
};
