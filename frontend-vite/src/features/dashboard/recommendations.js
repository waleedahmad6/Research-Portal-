import { normalizeOpportunity } from "../opportunities/opportunityDiscovery";

const normalizeValues = (values) => values.map((value) =>
    String(value).trim().toLocaleLowerCase()
);

const getDeadline = (opportunity) =>
    opportunity.application_deadline || opportunity.deadline || "";

export const scoreOpportunity = (opportunity, profile, now = new Date()) => {
    const item = normalizeOpportunity(opportunity);
    const requiredSkills = normalizeValues(item.skills);
    const matchedSkills = (profile.skills || []).filter((skill) =>
        requiredSkills.includes(String(skill).trim().toLocaleLowerCase())
    );
    const department = String(profile.department || "").trim().toLocaleLowerCase();
    const departmentMatch = Boolean(
        department && String(item.department || "").toLocaleLowerCase().includes(department)
    );
    const researchArea = String(opportunity.research_area || "").toLocaleLowerCase();
    const matchedInterests = (profile.interests || []).filter((interest) => {
        const normalized = String(interest).trim().toLocaleLowerCase();
        return normalized && (
            researchArea.includes(normalized) ||
            String(item.department || "").toLocaleLowerCase().includes(normalized) ||
            String(item.title || "").toLocaleLowerCase().includes(normalized)
        );
    });
    const deadlineValue = getDeadline(opportunity);
    const deadline = !deadlineValue
        ? null
        : /^\d{4}-\d{2}-\d{2}/.test(String(deadlineValue))
            ? new Date(
                Number(String(deadlineValue).slice(0, 4)),
                Number(String(deadlineValue).slice(5, 7)) - 1,
                Number(String(deadlineValue).slice(8, 10)),
                23,
                59,
                59,
                999
            )
            : new Date(deadlineValue);
    const notPassed = !deadline || Number.isNaN(deadline.getTime()) ||
        deadline.getTime() >= now.getTime();
    const positionsAvailable = item.positionsAvailable > 0;
    const skillScore = matchedSkills.length * 10;
    const profileMatchScore =
        (departmentMatch ? 4 : 0) + matchedInterests.length * 4;
    const availabilityScore = (notPassed ? 2 : 0) + (positionsAvailable ? 2 : 0);

    return {
        score: skillScore + profileMatchScore + availabilityScore,
        matchedSkills,
        matchedInterests,
        departmentMatch,
        notPassed,
        positionsAvailable
    };
};

const reasonFor = (result) => {
    if (result.matchedSkills.length > 0) {
        return `Matches your ${result.matchedSkills.slice(0, 3).join(" and ")} skills`;
    }
    if (result.matchedInterests.length > 0) {
        return `Matches your interest in ${result.matchedInterests[0]}`;
    }
    if (result.departmentMatch) return "Matches your department";
    if (!result.notPassed) return "Explore this opportunity";
    return "Recently added opportunity";
};

export const getRecommendedOpportunities = (
    opportunities,
    profile,
    appliedIds = [],
    now = new Date()
) => {
    const applied = new Set(appliedIds.map(String));
    const profileIsEmpty = !profile.skills?.length &&
        !profile.interests?.length &&
        !String(profile.department || "").trim();

    return opportunities
        .filter((opportunity) => !applied.has(String(opportunity.id)))
        .map((opportunity) => ({
            opportunity,
            ...scoreOpportunity(opportunity, profile, now)
        }))
        .sort((first, second) => {
            if (profileIsEmpty) {
                return new Date(second.opportunity.created_at || second.opportunity.createdAt || 0) -
                    new Date(first.opportunity.created_at || first.opportunity.createdAt || 0);
            }
            return second.score - first.score ||
                new Date(second.opportunity.created_at || second.opportunity.createdAt || 0) -
                new Date(first.opportunity.created_at || first.opportunity.createdAt || 0);
        })
        .slice(0, 6)
        .map((result) => ({
            ...result.opportunity,
            recommendationScore: result.score,
            recommendationReason: profileIsEmpty
                ? "Newest opportunity"
                : reasonFor(result)
        }));
};
