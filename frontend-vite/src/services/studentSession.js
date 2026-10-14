const SESSION_KEY = "research-portal-student-session";
const SESSION_EVENT = "research-portal-student-session-change";

export const getStudentSession = () => {
    const value = localStorage.getItem(SESSION_KEY);
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch (error) {
        throw new Error("Your local student session is invalid. Please sign in again.", {
            cause: error
        });
    }
};

export const setStudentSession = (student) => {
    const normalized = {
        firstName: String(student.firstName || "").trim(),
        email: String(student.email || "").trim().toLowerCase()
    };

    if (!normalized.firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
        throw new Error("Enter a first name and a valid email address.");
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(SESSION_EVENT));
    return normalized;
};

export const clearStudentSession = () => {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event(SESSION_EVENT));
};

export const subscribeToStudentSession = (callback) => {
    window.addEventListener(SESSION_EVENT, callback);
    window.addEventListener("storage", callback);

    return () => {
        window.removeEventListener(SESSION_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
};
