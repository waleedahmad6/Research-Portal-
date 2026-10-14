import { Link } from "react-router-dom";
import OpportunityCard from "../OpportunityCard";
import SaveOpportunityButton from "../SaveOpportunityButton";

export function DashboardHeader({ profile, summary }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <section className="dashboard-welcome">
            <p className="hero-eyebrow">YOUR RESEARCH, AT A GLANCE</p>
            <h1>{greeting}, {profile.firstName}</h1>
            <p>{summary}</p>
        </section>
    );
}

export function StatCard({ label, value, href, detail }) {
    return (
        <Link className="dashboard-stat-card" to={href} aria-label={`${label}: ${value}`}>
            <span className="dashboard-stat-label">{label}</span>
            <strong>{value}</strong>
            <span className="dashboard-stat-detail">{detail}</span>
        </Link>
    );
}

export function DashboardSection({ id, title, count, children, action }) {
    return (
        <section className="dashboard-section" id={id}>
            <div className="dashboard-section-heading">
                <div>
                    <h2>{title}</h2>
                    {count !== undefined && <span>{count}</span>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function SectionError({ onRetry }) {
    return (
        <div className="dashboard-section-error" role="alert">
            <p>This section could not be loaded.</p>
            <button className="text-button" type="button" onClick={onRetry}>
                Retry
            </button>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="dashboard-skeleton-grid" role="status" aria-label="Loading dashboard">
            {[0, 1, 2].map((item) => (
                <div className="dashboard-skeleton-card" key={item}>
                    <span />
                    <span />
                    <span />
                </div>
            ))}
        </div>
    );
}

export function RecommendedList({ opportunities }) {
    if (opportunities.length === 0) {
        return <p className="dashboard-empty">No new opportunities to recommend right now.</p>;
    }
    return (
        <div className="dashboard-card-grid">
            {opportunities.map((opportunity) => (
                <div className="recommended-card-wrap" key={opportunity.id}>
                    <p className="recommendation-reason">
                        Why recommended: {opportunity.recommendationReason}
                    </p>
                    <OpportunityCard opportunity={opportunity} />
                </div>
            ))}
        </div>
    );
}

export function SavedList({ items, onBrowse }) {
    if (items.length === 0) {
        return (
            <div className="dashboard-empty">
                <p>You haven’t saved any opportunities yet.</p>
                <Link className="text-link" to={onBrowse}>Browse opportunities</Link>
            </div>
        );
    }
    return (
        <ul className="dashboard-item-list">
            {items.map(({ opportunity }) => (
                <li className="dashboard-list-item" key={opportunity.id}>
                    <div>
                        <Link to={`/opportunities/${opportunity.id}`}>{opportunity.title}</Link>
                        <span>{opportunity.department || "Research opportunity"}</span>
                    </div>
                    <SaveOpportunityButton opportunityId={opportunity.id} compact />
                </li>
            ))}
        </ul>
    );
}

const statusClasses = {
    Draft: "application-status-draft",
    Submitted: "application-status-submitted",
    "Under review": "application-status-review",
    Shortlisted: "application-status-shortlisted",
    Accepted: "application-status-accepted",
    Rejected: "application-status-rejected",
    Withdrawn: "application-status-withdrawn"
};

export function ApplicationStatusList({ applications, onWithdraw }) {
    if (applications.length === 0) {
        return <p className="dashboard-empty">Your applications will appear here when you apply.</p>;
    }
    return (
        <ul className="dashboard-item-list">
            {applications.map((application) => (
                <li className="dashboard-list-item application-list-item" key={application.id}>
                    <div>
                        <Link to={`/opportunities/${application.opportunity.id}`}>
                            {application.opportunity.title}
                        </Link>
                        <span>
                            Applied {new Date(application.appliedAt).toLocaleDateString()} ·
                            {" "}Updated {new Date(application.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="application-actions">
                        <span className={`application-status ${statusClasses[application.status] || ""}`}>
                            {application.status}
                        </span>
                        {!["Withdrawn", "Accepted", "Rejected"].includes(application.status) && (
                            <button
                                className="text-button"
                                type="button"
                                onClick={() => onWithdraw(application.id)}
                                aria-label={`Withdraw application for ${application.opportunity.title}`}
                            >
                                Withdraw
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function DeadlineList({ items }) {
    if (items.length === 0) {
        return <p className="dashboard-empty">No saved or applied opportunities have deadlines in the next 14 days.</p>;
    }
    return (
        <ul className="dashboard-item-list">
            {items.map(({ opportunity, deadline, daysLeft }) => (
                <li className="dashboard-list-item" key={opportunity.id}>
                    <div>
                        <Link to={`/opportunities/${opportunity.id}`}>{opportunity.title}</Link>
                        <span>{deadline.toLocaleDateString()}</span>
                    </div>
                    <span className={`days-left${daysLeft <= 3 ? " days-left-urgent" : ""}`}>
                        {daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function RecentlyViewedList({ items }) {
    if (items.length === 0) {
        return <p className="dashboard-empty">Opportunities you view will show up here.</p>;
    }
    return (
        <>
            <ul className="dashboard-item-list">
                {items.map(({ opportunity, viewedAt }) => (
                    <li className="dashboard-list-item" key={opportunity.id}>
                        <div>
                            <Link to={`/opportunities/${opportunity.id}`}>{opportunity.title}</Link>
                            <span>Viewed {new Date(viewedAt).toLocaleString()}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
