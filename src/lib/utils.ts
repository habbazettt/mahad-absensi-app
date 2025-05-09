import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NavigateFunction } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types";

export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("auth_token");
  if (!token) return true;

  try {
    const decoded: TokenPayload = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return true;
  }
};

const navigate = (path: string) => {
  window.location.href = path
}

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
    navigate("/auth/login", { replace: true });
  }, 100);
};

export const authCheck = () => {
  const user = localStorage.getItem("user")
  if (!user || isTokenExpired()) {
    handleLogout(navigate as NavigateFunction)
    return false;
  }

  try {
    const userData = JSON.parse(user)
    if (userData.user_type !== "mentor") navigate("/auth/login")
    return true
  } catch (error) {
    console.error("Failed to parse user data:", error)
    navigate("/auth/login")
    return false
  }
}

export const authMahasantriCheck = () => {
  const user = localStorage.getItem("user")
  if (!user || isTokenExpired()) {
    handleLogout(navigate as NavigateFunction)
    return false;
  }

  try {
    const userData = JSON.parse(user)
    if (userData.user_type !== "mahasantri") navigate("/auth/login")
    return true
  } catch (error) {
    console.error("Failed to parse user data:", error)
    navigate("/auth/login")
    return false
  }
}
