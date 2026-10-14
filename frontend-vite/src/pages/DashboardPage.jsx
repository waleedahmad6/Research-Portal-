import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
    clearRecentlyViewed,
    getDashboardData,
    saveStudentProfile,
    subscribeToDashboardData,
    updateApplicationStatus
} from "../services/dashboardStorage";
import { getAllOpportunities } from "../services/opportunityApi";
import { clearStudentSession, getStudentSession } from "../services/studentSession";
import {
    ApplicationStatusList,
    DashboardHeader,
    DashboardSection,
    DashboardSkeleton,
    DeadlineList,
    RecommendedList,
    RecentlyViewedList,
    SavedList,
    SectionError,
    StatCard
} from "../components/dashboard/DashboardSections";
import "./DashboardPage.css";

const profileIsComplete = (profile) =>
    Boolean(profile.department.trim() || profile.skills.length || profile.interests.length);

function DashboardPage() {
    const student = getStudentSession();
    const studentEmail = student?.email;
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [profileForm, setProfileForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [profileError, setProfileError] = useState("");

    const refreshLocalData = useCallback((source = opportunities) => {
        try {
            const next = getDashboardData(source);
            setDashboard(next);
            setProfileForm({
                firstName: next.profile.firstName,
                department: next.profile.department,
                skills: next.profile.skills.join(", "),
                interests: next.profile.interests.join(", ")
            });
            setError("");
        } catch (requestError) {
            setError(requestError.message || "Could not load dashboard data.");
        }
    }, [opportunities]);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllOpportunities();
            const items = response.data.opportunities || [];
            setOpportunities(items);
            const data = getDashboardData(items);
            setDashboard(data);
            setProfileForm({
                firstName: data.profile.firstName,
                department: data.profile.department,
                skills: data.profile.skills.join(", "),
                interests: data.profile.interests.join(", ")
            });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Could not load your dashboard. Check that the backend is running."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!studentEmail) return undefined;
        const timeout = window.setTimeout(() => loadDashboard(), 0);
        return () => window.clearTimeout(timeout);
    }, [studentEmail, loadDashboard]);

    useEffect(() => subscribeToDashboardData(() => refreshLocalData()), [refreshLocalData]);

    if (!student) {
        return <Navigate to="/login" replace state={{ from: "/dashboard" }} />;
    }

    const handleProfileSubmit = (event) => {
        event.preventDefault();
        setProfileError("");
        try {
            saveStudentProfile(profileForm);
            setNotice("Your student profile has been updated.");
        } catch (requestError) {
            setProfileError(requestError.message || "Could not update your profile.");
        }
    };

    const handleWithdraw = (applicationId) => {
        try {
            updateApplicationStatus(applicationId, "Withdrawn");
            setNotice("Your application was withdrawn.");
        } catch (requestError) {
            setError(requestError.message || "Could not update that application.");
        }
    };

    const weeklyDeadlines = dashboard?.deadlines.filter((item) => item.daysLeft <= 7).length || 0;
    const inProgress = dashboard?.applications.filter(
        (application) => ["Draft", "Submitted", "Under review", "Shortlisted"].includes(application.status)
    ).length || 0;
    const summary = `You have ${weeklyDeadlines} deadline${weeklyDeadlines === 1 ? "" : "s"} this week and ${inProgress} application${inProgress === 1 ? "" : "s"} in progress.`;

    return (
        <div className="student-dashboard">
            <div className="dashboard-top-actions">
                <span>Signed in locally as {student.email}</span>
                <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                        clearStudentSession();
                        navigate("/login", { replace: true });
                    }}
                >
                    Sign out
                </button>
            </div>

            {notice && (
                <div className="success-message dashboard-notice" role="status">
                    {notice}
                    <button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button>
                </div>
            )}

            {dashboard && <DashboardHeader profile={dashboard.profile} summary={summary} />}

            {loading ? (
                <DashboardSkeleton />
            ) : dashboard ? (
                <>
                    <div className="dashboard-stats">
                        <StatCard
                            label="Saved opportunities"
                            value={dashboard.stats.saved}
                            detail="Your shortlist"
                            href="#saved"
                        />
                        <StatCard
                            label="Applications"
                            value={dashboard.stats.applications}
                            detail="Track progress"
                            href="#applications"
                        />
                        <StatCard
                            label="Upcoming deadlines"
                            value={dashboard.stats.deadlines}
                            detail="Next 14 days"
                            href="#deadlines"
                        />
                    </div>

                    {!profileIsComplete(dashboard.profile) && (
                        <div className="profile-prompt" role="status">
                            <strong>Personalize your recommendations</strong>
                            <span>Add your department, skills, or research interests below.</span>
                            <a className="text-link" href="#student-profile">Complete your profile</a>
                        </div>
                    )}

                    <div className="dashboard-grid">
                        <div className="dashboard-main-column">
                            <DashboardSection title="Recommended opportunities" count={dashboard.recommendations.length}>
                                {error ? <SectionError onRetry={loadDashboard} /> : (
                                    <RecommendedList opportunities={dashboard.recommendations} />
                                )}
                            </DashboardSection>
                            <DashboardSection id="saved" title="Saved opportunities" count={dashboard.saved.length}>
                                {error ? <SectionError onRetry={loadDashboard} /> : (
                                    <SavedList items={dashboard.saved} onBrowse="/opportunities" />
                                )}
                            </DashboardSection>
                            <DashboardSection id="applications" title="Application status" count={dashboard.applications.length}>
                                {error ? <SectionError onRetry={loadDashboard} /> : (
                                    <ApplicationStatusList
                                        applications={dashboard.applications}
                                        onWithdraw={handleWithdraw}
                                    />
                                )}
                            </DashboardSection>
                            <DashboardSection id="deadlines" title="Upcoming deadlines" count={dashboard.deadlines.length}>
                                {error ? <SectionError onRetry={loadDashboard} /> : (
                                    <DeadlineList items={dashboard.deadlines} />
                                )}
                            </DashboardSection>
                            <DashboardSection
                                title="Recently viewed"
                                count={dashboard.recentlyViewed.length}
                                action={dashboard.recentlyViewed.length > 0 ? (
                                    <button
                                        className="text-button"
                                        type="button"
                                        onClick={() => {
                                            clearRecentlyViewed();
                                            setNotice("Your recently viewed history was cleared.");
                                        }}
                                    >
                                        Clear history
                                    </button>
                                ) : null}
                            >
                                {error ? <SectionError onRetry={loadDashboard} /> : (
                                    <RecentlyViewedList
                                        items={dashboard.recentlyViewed}
                                        onClear={clearRecentlyViewed}
                                    />
                                )}
                            </DashboardSection>
                        </div>

                        <aside className="dashboard-side-column">
                            <section className="dashboard-profile-card" id="student-profile">
                                <p className="hero-eyebrow">PROFILE</p>
                                <h2>Your student profile</h2>
                                <p>Use your skills and interests to tailor opportunity recommendations.</p>
                                {profileError && <p className="error-message" role="alert">{profileError}</p>}
                                <form className="dashboard-profile-form" onSubmit={handleProfileSubmit}>
                                    <label>
                                        First name
                                        <input
                                            required
                                            value={profileForm?.firstName || ""}
                                            onChange={(event) => setProfileForm({ ...profileForm, firstName: event.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Department
                                        <input
                                            value={profileForm?.department || ""}
                                            onChange={(event) => setProfileForm({ ...profileForm, department: event.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Skills <span>(comma separated)</span>
                                        <textarea
                                            rows="3"
                                            value={profileForm?.skills || ""}
                                            onChange={(event) => setProfileForm({ ...profileForm, skills: event.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Research interests <span>(comma separated)</span>
                                        <textarea
                                            rows="3"
                                            value={profileForm?.interests || ""}
                                            onChange={(event) => setProfileForm({ ...profileForm, interests: event.target.value })}
                                        />
                                    </label>
                                    <button className="action-button primary-action" type="submit">
                                        Save profile
                                    </button>
                                </form>
                                <p className="local-data-note">
                                    Dashboard data is saved in this browser only.
                                </p>
                            </section>
                        </aside>
                    </div>
                    {error && (
                        <div className="dashboard-global-error" role="alert">
                            {error}
                            <button className="text-button" type="button" onClick={loadDashboard}>Retry loading</button>
                        </div>
                    )}
                </>
            ) : (
                <div className="dashboard-global-error" role="alert">
                    <p>{error || "Your dashboard could not be loaded."}</p>
                    <button className="action-button" type="button" onClick={loadDashboard}>Retry</button>
                    <Link className="text-link" to="/opportunities">Browse opportunities</Link>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;
