import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    isOpportunitySaved,
    saveOpportunity,
    subscribeToDashboardData,
    unsaveOpportunity
} from "../services/dashboardStorage";
import { getStudentSession } from "../services/studentSession";

function SaveOpportunityButton({ opportunityId, compact = false }) {
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const student = getStudentSession();
    const studentEmail = student?.email;

    useEffect(() => {
        if (!studentEmail) return undefined;

        const refresh = () => {
            try {
                setSaved(isOpportunitySaved(opportunityId));
                setError("");
            } catch (requestError) {
                setError(requestError.message || "Could not read your saved opportunities.");
            }
        };

        refresh();
        return subscribeToDashboardData(refresh);
    }, [opportunityId, studentEmail]);

    if (!student) {
        return (
            <Link
                className="save-opportunity-button"
                to="/login"
                aria-label="Sign in to save this opportunity"
            >
                Sign in to save
            </Link>
        );
    }

    const toggleSaved = async () => {
        const wasSaved = saved;
        setError("");
        setSaved(!wasSaved);
        try {
            await Promise.resolve();
            if (wasSaved) {
                unsaveOpportunity(opportunityId);
            } else {
                saveOpportunity(opportunityId);
            }
        } catch (requestError) {
            setSaved(wasSaved);
            setError(requestError.message || "Could not update saved opportunities.");
        }
    };

    return (
        <span className="save-button-wrap">
            <button
                className={`save-opportunity-button${compact ? " save-opportunity-compact" : ""}`}
                type="button"
                onClick={toggleSaved}
                aria-pressed={saved}
                aria-label={`${saved ? "Remove" : "Save"} this opportunity`}
                title={saved ? "Remove from saved opportunities" : "Save opportunity"}
            >
                {saved ? (compact ? "Unsave" : "Saved") : compact ? "Save" : "☆ Save"}
            </button>
            {error && <span className="save-error" role="alert">{error}</span>}
        </span>
    );
}

export default SaveOpportunityButton;
