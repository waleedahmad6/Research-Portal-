import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Link,
    NavLink,
    Route,
    Routes,
    useParams
} from "react-router-dom";
import OpportunityForm from "./components/OpportunityForm";
import OpportunityDelete from "./components/OpportunityDelete";
import { setOpportunities } from "./features/opportunities/opportunitySlice";
import {
    getAllOpportunities,
    getOpportunityById
} from "./services/opportunityApi";
import "./App.css";

function OpportunityList() {
    const dispatch = useDispatch();
    const opportunities = useSelector(
        (state) => state.opportunities.opportunities
    );
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

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

    return (
        <section className="opportunities-section">
            <div className="section-heading">
                <h2>Research Opportunities</h2>
            </div>

            {loadError ? (
                <p className="error-message" role="alert">{loadError}</p>
            ) : loading ? (
                <p className="empty-message" role="status">
                    Loading opportunities...
                </p>
            ) : opportunities.length === 0 ? (
                <p className="empty-message">
                    No research opportunities are available yet.
                </p>
            ) : (
                <div className="opportunity-list">
                    {opportunities.map((item) => (
                        <article className="opportunity-card" key={item.id}>
                            <Link
                                className="opportunity-card-link"
                                to={`/opportunities/${item.id}`}
                                aria-label={`View details for ${item.title}`}
                            >
                                <div className="card-heading">
                                    <h3>{item.title}</h3>
                                    <span
                                        className={`status ${
                                            item.status === "Open"
                                                ? "status-open"
                                                : "status-closed"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <p>{item.description}</p>
                                <p><strong>Research Area:</strong> {item.research_area}</p>
                                <p><strong>Faculty:</strong> {item.faculty_name}</p>
                                <p><strong>Department:</strong> {item.department}</p>
                                <p><strong>Required Skills:</strong> {item.required_skills}</p>
                                <p><strong>Positions:</strong> {item.available_positions}</p>
                                <p>
                                    <strong>Deadline:</strong>{" "}
                                    {String(item.application_deadline).slice(0, 10)}
                                </p>
                            </Link>
                            <div className="card-actions">
                                <Link
                                    className="action-button"
                                    to={`/update/${item.id}`}
                                >
                                    Update
                                </Link>
                                <Link
                                    className="action-button danger-action"
                                    to={`/delete/${item.id}`}
                                >
                                    Delete
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
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

    useEffect(() => {
        localStorage.setItem("research-portal-theme", theme);
        document.documentElement.style.colorScheme = theme;
    }, [theme]);

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

    useEffect(() => {
        let active = true;

        getOpportunityById(id)
            .then((response) => {
                if (active) setOpportunity(response.data.opportunity);
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
        </section>
    );
}

export default App;
