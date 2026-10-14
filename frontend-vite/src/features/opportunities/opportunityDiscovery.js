const splitValues = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value !== "string") {
        return [];
    }

    return value.split(",").map((item) => item.trim()).filter(Boolean);
};

export const normalizeOpportunity = (opportunity) => ({
    ...opportunity,
    title: opportunity.title || "Untitled research opportunity",
    faculty:
        opportunity.faculty ||
        opportunity.faculty_name ||
        "Faculty not specified",
    department: opportunity.department || "Department not specified",
    paid: Boolean(opportunity.paid),
    mode: opportunity.mode === "remote" ? "remote" : "on-campus",
    skills: splitValues(opportunity.skills || opportunity.required_skills),
    keywords: splitValues(opportunity.keywords),
    deadline:
        opportunity.deadline ||
        opportunity.application_deadline ||
        "",
    positionsAvailable: Number(
        opportunity.positionsAvailable ?? opportunity.available_positions ?? 0
    ),
    createdAt: opportunity.createdAt || opportunity.created_at || ""
});

const dateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const deadlineDate = (value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return new Date(
            Number(value.slice(0, 4)),
            Number(value.slice(5, 7)) - 1,
            Number(value.slice(8, 10))
        );
    }
    return dateValue(value);
};

const startOfToday = (date = new Date()) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getDeadlineState = (deadline, now = new Date()) => {
    const date = deadlineDate(deadline);
    if (!date) return "normal";

    const today = startOfToday(now);
    const deadlineDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
    const daysRemaining = Math.ceil(
        (deadlineDay.getTime() - today.getTime()) / 86400000
    );

    if (daysRemaining < 0) return "closed";
    if (daysRemaining <= 7) return "closing";
    return "normal";
};

const searchScore = (opportunity, query) => {
    if (!query) return 0;

    const term = query.toLocaleLowerCase();
    const title = String(opportunity.title || "").toLocaleLowerCase();
    const keywordValues = [
        ...opportunity.keywords,
        ...opportunity.skills
    ].map((value) => String(value).toLocaleLowerCase());
    const otherValues = [
        opportunity.faculty,
        opportunity.department
    ].map((value) => String(value || "").toLocaleLowerCase());

    if (title.includes(term)) {
        return 300 + (title.startsWith(term) ? 10 : 0);
    }
    if (keywordValues.some((value) => value.includes(term))) return 200;
    if (otherValues.some((value) => value.includes(term))) return 100;
    return 0;
};

const createdTimestamp = (opportunity) =>
    dateValue(opportunity.createdAt)?.getTime() || 0;

export const filterAndSortOpportunities = (
    opportunities,
    {
        query = "",
        paid = "",
        mode = "",
        skills = [],
        deadline = "any",
        sort = "newest"
    } = {},
    now = new Date()
) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const today = startOfToday(now);
    const deadlineLimit =
        deadline === "7" || deadline === "30"
            ? new Date(today.getTime() + Number(deadline) * 86400000)
            : null;
    const selectedSkills = new Set(
        skills.map((skill) => skill.toLocaleLowerCase())
    );

    const filtered = opportunities
        .map(normalizeOpportunity)
        .filter((opportunity) => {
            const searchableValues = [
                opportunity.title,
                opportunity.faculty,
                opportunity.department,
                ...opportunity.keywords,
                ...opportunity.skills
            ];
            const matchesQuery =
                !normalizedQuery ||
                searchableValues.some((value) =>
                    String(value || "")
                        .toLocaleLowerCase()
                        .includes(normalizedQuery)
                );
            const matchesPaid =
                paid === "" || opportunity.paid === (paid === "paid");
            const matchesMode = !mode || opportunity.mode === mode;
            const matchesSkills =
                selectedSkills.size === 0 ||
                [...selectedSkills].every((selectedSkill) =>
                    opportunity.skills.some((skill) =>
                        skill.toLocaleLowerCase() === selectedSkill
                    )
                );
            const dueDate = deadlineDate(opportunity.deadline);
            const matchesDeadline =
                !deadlineLimit ||
                (dueDate &&
                    dueDate >= today &&
                    dueDate < new Date(deadlineLimit.getTime() + 86400000));

            return (
                matchesQuery &&
                matchesPaid &&
                matchesMode &&
                matchesSkills &&
                matchesDeadline
            );
        });

    return filtered.sort((first, second) => {
        if (sort === "closing") {
            const firstDeadline =
                getDeadlineState(first.deadline, now) === "closed"
                    ? Infinity
                    : deadlineDate(first.deadline)?.getTime() || Infinity;
            const secondDeadline =
                getDeadlineState(second.deadline, now) === "closed"
                    ? Infinity
                    : deadlineDate(second.deadline)?.getTime() || Infinity;
            if (firstDeadline === secondDeadline) {
                return createdTimestamp(second) - createdTimestamp(first);
            }
            return firstDeadline - secondDeadline;
        }

        if (sort === "relevant" && normalizedQuery) {
            const relevance =
                searchScore(second, normalizedQuery) -
                searchScore(first, normalizedQuery);
            if (relevance !== 0) return relevance;
        }

        return createdTimestamp(second) - createdTimestamp(first);
    });
};

export const getOpportunitySkills = (opportunities) => {
    const skills = new Set();

    opportunities.forEach((opportunity) => {
        normalizeOpportunity(opportunity).skills.forEach((skill) =>
            skills.add(skill)
        );
    });

    return [...skills].sort((first, second) =>
        first.localeCompare(second)
    );
};
