import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { removeOpportunity } from "../features/opportunities/opportunitySlice";
import {
    deleteOpportunity as deleteOpportunityRequest,
    getOpportunityById
} from "../services/opportunityApi";

function OpportunityDelete() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
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

    const handleDelete = async () => {
        setDeleting(true);
        setError("");

        try {
            await deleteOpportunityRequest(id);
            dispatch(removeOpportunity(opportunity.id));
            navigate("/opportunities");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not delete this opportunity."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <section className="form-section">
            <h2>Delete Research Opportunity</h2>
            {loading ? (
                <p className="empty-message" role="status">
                    Loading opportunity...
                </p>
            ) : error && !opportunity ? (
                <p className="error-message" role="alert">{error}</p>
            ) : (
                <>
                    <p>
                        Are you sure you want to delete{" "}
                        <strong>{opportunity?.title}</strong>? This cannot be undone.
                    </p>
                    {error && (
                        <p className="error-message" role="alert">{error}</p>
                    )}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="danger-button"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete Opportunity"}
                        </button>
                        <Link
                            className="secondary-button"
                            to="/opportunities"
                        >
                            Cancel
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
}

export default OpportunityDelete;
