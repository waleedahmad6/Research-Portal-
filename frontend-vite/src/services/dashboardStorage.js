import { getStudentSession } from "./studentSession";
import { getRecommendedOpportunities } from "../features/dashboard/recommendations";

const STORAGE_PREFIX = "research-portal-dashboard";
const DATA_EVENT = "research-portal-dashboard-change";
const APPLICATION_STATUSES = new Set([
    "Draft",
    "Submitted",
    "Under review",
    "Shortlisted",
    "Accepted",
    "Rejected",
    "Withdrawn"
]);

export class DashboardDataError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = "DashboardDataError";
        this.status = status;
    }
}

const currentKey = (kind) => {
    const student = getStudentSession();
    if (!student) {
        throw new DashboardDataError("Sign in as a student to use your dashboard.", 401);
    }
    return `${STORAGE_PREFIX}:${encodeURIComponent(student.email)}:${kind}`;
};

const readList = (kind) => {
    const value = localStorage.getItem(currentKey(kind));
    if (!value) return [];

    let records;
    try {
        records = JSON.parse(value);
    } catch {
        throw new DashboardDataError(`Your saved ${kind} data could not be read.`);
    }

    if (!Array.isArray(records)) {
        throw new DashboardDataError(`Your saved ${kind} data has an invalid format.`);
    }
    return records;
};

const writeList = (kind, records) => {
    localStorage.setItem(currentKey(kind), JSON.stringify(records));
    window.dispatchEvent(new Event(DATA_EVENT));
};

const profileDefaults = () => {
    const student = getStudentSession();
    if (!student) {
        throw new DashboardDataError("Sign in as a student to use your dashboard.", 401);
    }
    return {
        firstName: student.firstName,
        department: "",
        skills: [],
        interests: []
    };
};

const normalizeTextList = (values) => {
    const list = Array.isArray(values) ? values : String(values || "").split(",");
    return [...new Set(list.map((value) => String(value).trim()).filter(Boolean))];
};

export const getStudentProfile = () => {
    const value = localStorage.getItem(currentKey("profile"));
    if (!value) return profileDefaults();

    let profile;
    try {
        profile = JSON.parse(value);
    } catch {
        throw new DashboardDataError("Your student profile could not be read.");
    }

    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
        throw new DashboardDataError("Your student profile has an invalid format.");
    }

    const defaults = profileDefaults();
    return {
        firstName: String(profile.firstName || defaults.firstName),
        department: String(profile.department || ""),
        skills: normalizeTextList(profile.skills),
        interests: normalizeTextList(profile.interests)
    };
};

export const saveStudentProfile = (profile) => {
    const normalized = {
        firstName: String(profile.firstName || "").trim(),
        department: String(profile.department || "").trim(),
        skills: normalizeTextList(profile.skills),
        interests: normalizeTextList(profile.interests)
    };
    if (!normalized.firstName) {
        throw new DashboardDataError("Your first name is required.");
    }
    localStorage.setItem(currentKey("profile"), JSON.stringify(normalized));
    window.dispatchEvent(new Event(DATA_EVENT));
    return normalized;
};

export const getSavedOpportunities = () => readList("saved")
    .sort((first, second) => new Date(second.savedAt) - new Date(first.savedAt));

export const isOpportunitySaved = (opportunityId) =>
    readList("saved").some(
        (item) => String(item.opportunityId) === String(opportunityId)
    );

export const saveOpportunity = (opportunityId) => {
    if (opportunityId === undefined || opportunityId === null || opportunityId === "") {
        throw new DashboardDataError("An opportunity ID is required.");
    }
    const saved = readList("saved");
    if (saved.some((item) => String(item.opportunityId) === String(opportunityId))) {
        return saved;
    }
    saved.push({ opportunityId, savedAt: new Date().toISOString() });
    writeList("saved", saved);
    return saved;
};

export const unsaveOpportunity = (opportunityId) => {
    const saved = readList("saved").filter(
        (item) => String(item.opportunityId) !== String(opportunityId)
    );
    writeList("saved", saved);
    return saved;
};

export const getApplications = () => readList("applications")
    .sort((first, second) => new Date(second.appliedAt) - new Date(first.appliedAt));

export const applyToOpportunity = (opportunityId) => {
    if (opportunityId === undefined || opportunityId === null || opportunityId === "") {
        throw new DashboardDataError("An opportunity ID is required.");
    }
    const applications = readList("applications");
    if (applications.some((item) => String(item.opportunityId) === String(opportunityId))) {
        throw new DashboardDataError("You have already applied to this opportunity.", 409);
    }

    const now = new Date().toISOString();
    const application = {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        opportunityId,
        status: "Submitted",
        appliedAt: now,
        updatedAt: now
    };
    writeList("applications", [...applications, application]);
    return application;
};

export const updateApplicationStatus = (applicationId, status) => {
    if (!APPLICATION_STATUSES.has(status)) {
        throw new DashboardDataError("That application status is not valid.");
    }
    if (status !== "Withdrawn") {
        throw new DashboardDataError("Students may only withdraw their own applications.", 403);
    }

    let found = false;
    const applications = readList("applications").map((application) => {
        if (String(application.id) !== String(applicationId)) return application;
        found = true;
        return { ...application, status, updatedAt: new Date().toISOString() };
    });
    if (!found) throw new DashboardDataError("Application not found.", 404);
    writeList("applications", applications);
    return applications.find((application) => String(application.id) === String(applicationId));
};

export const getRecentlyViewed = () => readList("views")
    .sort((first, second) => new Date(second.viewedAt) - new Date(first.viewedAt))
    .slice(0, 20);

export const recordOpportunityView = (opportunityId) => {
    if (opportunityId === undefined || opportunityId === null || opportunityId === "") {
        throw new DashboardDataError("An opportunity ID is required.");
    }
    const existing = readList("views").filter(
        (item) => String(item.opportunityId) !== String(opportunityId)
    );
    writeList("views", [
        { opportunityId, viewedAt: new Date().toISOString() },
        ...existing
    ].slice(0, 20));
};

export const clearRecentlyViewed = () => writeList("views", []);

export const subscribeToDashboardData = (callback) => {
    window.addEventListener(DATA_EVENT, callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener(DATA_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
};

export const getDashboardData = (opportunities) => {
    const byId = new Map(opportunities.map((opportunity) => [
        String(opportunity.id),
        opportunity
    ]));
    const profile = getStudentProfile();
    const saved = getSavedOpportunities().flatMap((item) => {
        const opportunity = byId.get(String(item.opportunityId));
        return opportunity ? [{ ...item, opportunity }] : [];
    });
    const applications = getApplications().flatMap((item) => {
        const opportunity = byId.get(String(item.opportunityId));
        return opportunity ? [{ ...item, opportunity }] : [];
    });
    const recentlyViewed = getRecentlyViewed().flatMap((item) => {
        const opportunity = byId.get(String(item.opportunityId));
        return opportunity ? [{ ...item, opportunity }] : [];
    }).slice(0, 5);
    const deadlineEntries = new Map();

    [...saved, ...applications].forEach((item) => {
        const opportunity = item.opportunity;
        if (!opportunity.application_deadline && !opportunity.deadline) return;
        deadlineEntries.set(String(opportunity.id), opportunity);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlines = [...deadlineEntries.values()].flatMap((opportunity) => {
        const dateValue = opportunity.application_deadline || opportunity.deadline;
        const deadline = /^\d{4}-\d{2}-\d{2}/.test(String(dateValue))
            ? new Date(
                Number(String(dateValue).slice(0, 4)),
                Number(String(dateValue).slice(5, 7)) - 1,
                Number(String(dateValue).slice(8, 10))
            )
            : new Date(dateValue);
        deadline.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
        return Number.isNaN(deadline.getTime()) || daysLeft < 0 || daysLeft > 14
            ? []
            : [{ opportunity, deadline, daysLeft }];
    }).sort((first, second) => first.deadline - second.deadline);

    return {
        profile,
        saved,
        applications,
        recommendations: getRecommendedOpportunities(
            opportunities,
            profile,
            applications.map((item) => item.opportunityId)
        ),
        deadlines,
        recentlyViewed,
        stats: {
            saved: saved.length,
            applications: applications.length,
            deadlines: deadlines.length
        }
    };
};
