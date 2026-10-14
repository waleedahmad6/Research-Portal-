
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    addOpportunity,
    updateOpportunity as updateOpportunityInStore
} from "../features/opportunities/opportunitySlice";
import {
    createOpportunity as createOpportunityRequest,
    getOpportunityById,
    updateOpportunity as updateOpportunityRequest
} from "../services/opportunityApi";

const initialForm = {
    title: "",
    description: "",
    research_area: "",
    faculty_name: "",
    department: "",
    required_skills: "",
    available_positions: "1",
    application_deadline: "",
    paid: false,
    mode: "on-campus",
    status: "Open"
};

function OpportunityForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [loadingOpportunity, setLoadingOpportunity] = useState(Boolean(id));
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const editing = Boolean(id);

    useEffect(() => {
        if (!id) return;

        let active = true;

        getOpportunityById(id)
            .then((response) => {
                if (!active) return;

                const opportunity = response.data.opportunity;
                setFormData({
                    ...opportunity,
                    required_skills: Array.isArray(opportunity.required_skills)
                        ? opportunity.required_skills.join(", ")
                        : opportunity.required_skills,
                    available_positions: String(opportunity.available_positions),
                    paid: Boolean(opportunity.paid),
                    mode: opportunity.mode || "on-campus",
                    application_deadline: String(
                        opportunity.application_deadline
                    ).slice(0, 10)
                });
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
                if (active) setLoadingOpportunity(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const skills = formData.required_skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);
            const data = {
                ...formData,
                skills,
                keywords: [formData.research_area, ...skills].filter(Boolean),
                available_positions: Number(
                    formData.available_positions
                )
            };

            const response = editing
                ? await updateOpportunityRequest(id, data)
                : await createOpportunityRequest(data);
            const opportunity = response.data.opportunity;

            if (editing) {
                dispatch(updateOpportunityInStore(opportunity));
            } else {
                dispatch(addOpportunity(opportunity));
            }

            setMessage(response.data.message || "Opportunity saved successfully!");
            navigate("/opportunities");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create opportunity. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-section">
            <h2>{editing ? "Update Research Opportunity" : "Create Research Opportunity"}</h2>
            <p className="form-description">
                {editing
                    ? "Update the details for this research opportunity."
                    : "Enter the details below to publish a new research opportunity."}
            </p>

            {loadingOpportunity && (
                <p className="empty-message" role="status">
                    Loading opportunity...
                </p>
            )}

            {message && (
                <div className="success-message" role="status">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="title">Opportunity Title</label>
                        <input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. AI Research Assistant"
                            required
                            maxLength={200}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="research_area">Research Area</label>
                        <input
                            id="research_area"
                            name="research_area"
                            value={formData.research_area}
                            onChange={handleChange}
                            placeholder="e.g. Artificial Intelligence"
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the research project..."
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="faculty_name">Faculty Member</label>
                        <input
                            id="faculty_name"
                            name="faculty_name"
                            value={formData.faculty_name}
                            onChange={handleChange}
                            placeholder="e.g. Dr. Jane Smith"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="department">Department</label>
                        <input
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. Computer Science"
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="required_skills">Required Skills</label>
                        <input
                            id="required_skills"
                            name="required_skills"
                            value={formData.required_skills}
                            onChange={handleChange}
                            placeholder="e.g. Python, machine learning"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="available_positions">
                            Available Positions
                        </label>
                        <input
                            id="available_positions"
                            name="available_positions"
                            type="number"
                            min="0"
                            step="1"
                            value={formData.available_positions}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="application_deadline">
                            Application Deadline
                        </label>
                        <input
                            id="application_deadline"
                            name="application_deadline"
                            type="date"
                            value={formData.application_deadline}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mode">Work arrangement</label>
                        <select
                            id="mode"
                            name="mode"
                            value={formData.mode}
                            onChange={handleChange}
                            required
                        >
                            <option value="on-campus">On-campus</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>

                    <label className="checkbox-form-group">
                        <input
                            id="paid"
                            name="paid"
                            type="checkbox"
                            checked={formData.paid}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    paid: event.target.checked
                                })
                            }
                        />
                        <span>Paid research opportunity</span>
                    </label>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || loadingOpportunity}
                    >
                        {loading
                            ? (editing ? "Updating..." : "Creating...")
                            : (editing ? "Update Opportunity" : "Create Opportunity")}
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate("/opportunities")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}

export default OpportunityForm;
