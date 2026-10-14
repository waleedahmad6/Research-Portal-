import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Link,
    NavLink,
    Route,
    Routes,
    useSearchParams,
    useParams
} from "react-router-dom";
import OpportunityForm from "./components/OpportunityForm";
import OpportunityDelete from "./components/OpportunityDelete";
import OpportunityCard, {
    OpportunityCardSkeleton
} from "./components/OpportunityCard";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import SortDropdown from "./components/SortDropdown";
import SaveOpportunityButton from "./components/SaveOpportunityButton";
import ApplyOpportunityButton from "./components/ApplyOpportunityButton";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { setOpportunities } from "./features/opportunities/opportunitySlice";
import {
    filterAndSortOpportunities,
    getOpportunitySkills
} from "./features/opportunities/opportunityDiscovery";
import {
    getAllOpportunities,
    getOpportunityById
} from "./services/opportunityApi";
import { recordOpportunityView } from "./services/dashboardStorage";
import {
    getStudentSession,
    subscribeToStudentSession
} from "./services/studentSession";
import "./App.css";

function OpportunityList() {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const opportunities = useSelector(
        (state) => state.opportunities.opportunities
    );
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const searchQuery = searchParams.get("q") || "";
    const [searchInput, setSearchInput] = useState(searchQuery);
    const paid = searchParams.get("paid") || "";
    const mode = searchParams.get("mode") || "";
    const selectedSkills = searchParams.getAll("skill");
    const deadline = searchParams.get("deadline") || "any";
    const sort = searchParams.get("sort") || "newest";

    useEffect(() => {
        let active = true;

        getAllOpportunities()
            .then((response) => {
                if (active) {
                    dispatch(setOpportunities(response.data.opportunities));
                }
            })
            .catch((error) => {
                if (active) {
                    setLoadError(
                        error.response?.data?.message ||
                            "Could not load opportunities. Check that the backend is running."
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [dispatch]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearchInput(searchQuery);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearchParams((currentParams) => {
                const nextParams = new URLSearchParams(currentParams);
                if (searchInput.trim()) {
                    nextParams.set("q", searchInput.trim());
                } else {
                    nextParams.delete("q");
                }
                return nextParams;
            }, { replace: true });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchInput, setSearchParams]);

    const updateParam = (key, value, defaultValue = "") => {
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            if (value && value !== defaultValue) {
                nextParams.set(key, value);
            } else {
                nextParams.delete(key);
            }
            return nextParams;
        }, { replace: true });
    };

    const updateSkills = (skills) => {
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            nextParams.delete("skill");
            skills.forEach((skill) => nextParams.append("skill", skill));
            return nextParams;
        }, { replace: true });
    };

    const availableSkills = getOpportunitySkills(opportunities);
    const filteredOpportunities = filterAndSortOpportunities(opportunities, {
        query: searchQuery,
        paid,
        mode,
        skills: selectedSkills,
        deadline,
        sort
    });
    const activeFilterCount =
        Number(Boolean(searchQuery)) +
        Number(Boolean(paid)) +
        Number(Boolean(mode)) +
        selectedSkills.length +
        Number(deadline !== "any");

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    return (
        <section className="opportunities-section">
            <div className="discovery-heading">
                <div>
                    <p className="hero-eyebrow">FIND YOUR NEXT PROJECT</p>
                    <h2>Smart Opportunity Discovery</h2>
                    <p className="form-description">
                        Explore faculty-led research and find a project that fits your interests.
                    </p>
                </div>
                <SortDropdown
                    value={sort}
                    onChange={(value) => updateParam("sort", value, "newest")}
                />
            </div>

            {loadError ? (
                <p className="error-message" role="alert">{loadError}</p>
            ) : (
                <>
                    <SearchBar value={searchInput} onChange={setSearchInput} />
                    <FilterPanel
                        paid={paid}
                        mode={mode}
                        skills={selectedSkills}
                        availableSkills={availableSkills}
                        deadline={deadline}
                        onPaidChange={(value) => updateParam("paid", value)}
                        onModeChange={(value) => updateParam("mode", value)}
                        onSkillsChange={updateSkills}
                        onDeadlineChange={(value) =>
                            updateParam("deadline", value, "any")
                        }
                        activeFilterCount={activeFilterCount}
                        onClear={clearFilters}
                    />
                    <p className="results-count" aria-live="polite">
                        Showing {loading ? 0 : filteredOpportunities.length} of{" "}
                        {opportunities.length} opportunities
                    </p>
                    {loading ? (
                        <div className="opportunity-list" role="status" aria-label="Loading opportunities">
                            {Array.from({ length: 6 }, (_, index) => (
                                <OpportunityCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : opportunities.length === 0 ? (
                        <p className="empty-message">
                            No research opportunities are available yet.
                        </p>
                    ) : filteredOpportunities.length === 0 ? (
                        <div className="discovery-empty">
                            <h3>No opportunities match your search</h3>
                            <p>Try a different search or clear your filters to see more research projects.</p>
                            <button
                                className="action-button primary-action"
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="opportunity-list">
                            {filteredOpportunities.map((item) => (
                                <OpportunityCard opportunity={item} key={item.id} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

function UpdateOpportunityRoute() {
    const { id } = useParams();
    return <OpportunityForm key={id} />;
}

function HomePage() {
    return (
        <section className="home-hero">
            <p className="hero-eyebrow">DISCOVER. RESEARCH. INNOVATE.</p>
            <h2>University Research Portal</h2>
            <p className="hero-description">
                Find meaningful research opportunities, explore faculty-led
                projects, and connect with the ideas shaping tomorrow.
            </p>
            <div className="hero-actions">
                <Link className="action-button primary-action" to="/opportunities">
                    Explore Opportunities
                </Link>
            </div>
        </section>
    );
}

function App() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("research-portal-theme") || "light"
    );
    const [student, setStudent] = useState(() => getStudentSession());

    useEffect(() => {
        localStorage.setItem("research-portal-theme", theme);
        document.documentElement.style.colorScheme = theme;
    }, [theme]);

    useEffect(
        () => subscribeToStudentSession(() => setStudent(getStudentSession())),
        []
    );

    return (
        <div className="app" data-theme={theme}>
            <header className="navbar">
                <div className="navbar-content">
                    <nav className="nav-links" aria-label="Main navigation">
                        <NavLink end className="action-button nav-button" to="/">
                            Home
                        </NavLink>
                        <NavLink className="action-button nav-button" to="/opportunities">
                            Opportunities
                        </NavLink>
                        <NavLink className="action-button primary-action" to="/create">
                            Create
                        </NavLink>
                        {student ? (
                            <NavLink className="action-button nav-button" to="/dashboard">
                                Dashboard
                            </NavLink>
                        ) : (
                            <NavLink className="action-button nav-button" to="/login">
                                Student sign in
                            </NavLink>
                        )}
                    </nav>
                    <button
                        className="action-button theme-toggle"
                        type="button"
                        onClick={() =>
                            setTheme((currentTheme) =>
                                currentTheme === "light" ? "dark" : "light"
                            )
                        }
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    >
                        {theme === "light" ? "Dark mode" : "Light mode"}
                    </button>
                </div>
            </header>

            <main className="container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/opportunities" element={<OpportunityList />} />
                    <Route path="/opportunities/:id" element={<OpportunityDetails />} />
                    <Route path="/create" element={<OpportunityForm key="create" />} />
                    <Route path="/update/:id" element={<UpdateOpportunityRoute />} />
                    <Route path="/delete/:id" element={<OpportunityDelete />} />
                    <Route
                        path="*"
                        element={
                            <section className="form-section">
                                <h2>Page not found</h2>
                                <Link className="text-link" to="/opportunities">
                                    View opportunities
                                </Link>
                            </section>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

function OpportunityDetails() {
    const { id } = useParams();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewError, setViewError] = useState("");

    useEffect(() => {
        let active = true;

        getOpportunityById(id)
            .then((response) => {
                if (!active) return;
                const item = response.data.opportunity;
                setOpportunity(item);
                if (getStudentSession()) {
                    try {
                        recordOpportunityView(item.id);
                    } catch (viewRequestError) {
                        setViewError(viewRequestError.message || "Could not record this view.");
                    }
                }
            })
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "Could not load this opportunity."
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    if (loading) {
        return <p className="empty-message" role="status">Loading opportunity...</p>;
    }

    if (error) {
        return <p className="error-message" role="alert">{error}</p>;
    }

    return (
        <section className="opportunity-card">
            <div className="card-heading">
                <h2>{opportunity.title}</h2>
                <span
                    className={`status ${
                        opportunity.status === "Open" ? "status-open" : "status-closed"
                    }`}
                >
                    {opportunity.status}
                </span>
            </div>
            <p>{opportunity.description}</p>
            <p><strong>Research Area:</strong> {opportunity.research_area}</p>
            <p><strong>Faculty:</strong> {opportunity.faculty_name}</p>
            <p><strong>Department:</strong> {opportunity.department}</p>
            <p><strong>Required Skills:</strong> {opportunity.required_skills}</p>
            <p><strong>Positions:</strong> {opportunity.available_positions}</p>
            <p>
                <strong>Deadline:</strong>{" "}
                {String(opportunity.application_deadline).slice(0, 10)}
            </p>
            <div className="card-actions">
                <SaveOpportunityButton opportunityId={opportunity.id} />
                <ApplyOpportunityButton opportunityId={opportunity.id} />
                <Link className="action-button" to={`/update/${opportunity.id}`}>
                    Update
                </Link>
                <Link
                    className="action-button danger-action"
                    to={`/delete/${opportunity.id}`}
                >
                    Delete
                </Link>
                <Link className="action-button nav-button" to="/opportunities">
                    Back to Opportunities
                </Link>
            </div>
            {viewError && <p className="error-message" role="alert">{viewError}</p>}
        </section>
    );
}

export default App;
