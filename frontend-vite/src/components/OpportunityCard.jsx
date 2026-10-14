import { Link } from "react-router-dom";
import { getDeadlineState, normalizeOpportunity } from "../features/opportunities/opportunityDiscovery";
import SaveOpportunityButton from "./SaveOpportunityButton";

const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";
    const date =
        typeof deadline === "string" && /^\d{4}-\d{2}-\d{2}/.test(deadline)
            ? new Date(
                Number(deadline.slice(0, 4)),
                Number(deadline.slice(5, 7)) - 1,
                Number(deadline.slice(8, 10))
            )
            : new Date(deadline);
    if (Number.isNaN(date.getTime())) return "Deadline not specified";

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
};

function OpportunityCard({ opportunity }) {
    const item = normalizeOpportunity(opportunity);
    const deadlineState =
        item.status !== "Open" && item.status !== "OPEN"
            ? "closed"
            : getDeadlineState(item.deadline);
    const deadlineLabel =
        deadlineState === "closed"
            ? "Closed"
            : deadlineState === "closing"
                ? "Closing soon"
                : formatDeadline(item.deadline);

    return (
        <article className="opportunity-card discovery-card">
            <div className="discovery-card-topline">
                <span className="opportunity-area">
                    {item.research_area || "Research"}
                </span>
                <span
                    className={`status deadline-${deadlineState}`}
                    aria-label={`Application deadline: ${deadlineLabel}`}
                >
                    {deadlineLabel}
                </span>
            </div>
            <h3>{item.title}</h3>
            <p className="opportunity-faculty">
                <strong>{item.faculty}</strong>
                <span aria-hidden="true"> · </span>
                {item.department}
            </p>
            {item.description && (
                <p className="discovery-description">{item.description}</p>
            )}
            <div className="opportunity-badges" aria-label="Opportunity details">
                <span className={`detail-badge ${item.paid ? "badge-paid" : "badge-unpaid"}`}>
                    {item.paid ? "Paid" : "Unpaid"}
                </span>
                <span className="detail-badge">
                    {item.mode === "remote" ? "Remote" : "On-campus"}
                </span>
            </div>
            {item.skills.length > 0 && (
                <div className="skill-list" aria-label="Required skills">
                    {item.skills.map((skill) => (
                        <span className="skill-tag" key={skill}>{skill}</span>
                    ))}
                </div>
            )}
            <div className="discovery-card-footer">
                <span className="positions-count">
                    {item.positionsAvailable}{" "}
                    {item.positionsAvailable === 1 ? "position" : "positions"} left
                </span>
                <SaveOpportunityButton opportunityId={item.id} compact />
                <Link
                    className="action-button primary-action"
                    to={`/opportunities/${item.id}`}
                    aria-label={`View details for ${item.title}`}
                >
                    View details
                </Link>
                <div className="card-management-actions">
                    <Link className="text-link" to={`/update/${item.id}`}>
                        Update
                    </Link>
                    <Link
                        className="text-link danger-link"
                        to={`/delete/${item.id}`}
                    >
                        Delete
                    </Link>
                </div>
            </div>
        </article>
    );
}

export function OpportunityCardSkeleton() {
    return (
        <article className="opportunity-card skeleton-card" aria-hidden="true">
            <span className="skeleton-line skeleton-short" />
            <span className="skeleton-line skeleton-title" />
            <span className="skeleton-line skeleton-medium" />
            <span className="skeleton-line skeleton-long" />
            <span className="skeleton-line skeleton-medium" />
            <span className="skeleton-line skeleton-short" />
        </article>
    );
}

export default OpportunityCard;
