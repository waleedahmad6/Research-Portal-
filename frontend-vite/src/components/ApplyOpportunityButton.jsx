import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    applyToOpportunity,
    getApplications,
    subscribeToDashboardData
} from "../services/dashboardStorage";
import { getStudentSession } from "../services/studentSession";

function ApplyOpportunityButton({ opportunityId }) {
    const student = getStudentSession();
    const studentEmail = student?.email;
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!studentEmail) return undefined;

        const refresh = () => {
            try {
                setApplied(getApplications().some(
                    (application) => String(application.opportunityId) === String(opportunityId)
                ));
            } catch (requestError) {
                setError(requestError.message || "Could not read your application status.");
            }
        };
        refresh();
        return subscribeToDashboardData(refresh);
    }, [opportunityId, studentEmail]);

    if (!student) {
        return (
            <Link className="action-button primary-action" to="/login">
                Sign in to apply
            </Link>
        );
    }

    const submitApplication = () => {
        setError("");
        try {
            applyToOpportunity(opportunityId);
            setApplied(true);
        } catch (requestError) {
            setError(requestError.message || "Could not submit your application.");
        }
    };

    return (
        <span className="apply-button-wrap">
            <button
                className="action-button primary-action"
                type="button"
                disabled={applied}
                onClick={submitApplication}
            >
                {applied ? "Application submitted" : "Apply"}
            </button>
            {error && <span className="save-error" role="alert">{error}</span>}
        </span>
    );
}

export default ApplyOpportunityButton;
