import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { saveStudentProfile } from "../services/dashboardStorage";
import { getStudentSession, setStudentSession } from "../services/studentSession";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const existingStudent = getStudentSession();
    const [form, setForm] = useState({
        firstName: "",
        email: "",
        department: "",
        skills: "",
        interests: ""
    });
    const [error, setError] = useState("");

    if (existingStudent) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");
        try {
            const student = setStudentSession(form);
            saveStudentProfile({
                firstName: student.firstName,
                department: form.department,
                skills: form.skills,
                interests: form.interests
            });
            const destination = location.state?.from || "/dashboard";
            navigate(destination, { replace: true });
        } catch (requestError) {
            setError(requestError.message || "Could not create a local student session.");
        }
    };

    return (
        <section className="form-section local-login">
            <p className="hero-eyebrow">STUDENT ACCESS</p>
            <h2>Continue to your dashboard</h2>
            <p className="form-description">
                This project does not yet include server-side authentication. This local
                student profile is stored only in this browser and is for development/demo use.
            </p>
            {error && <p className="error-message" role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="student-first-name">First name</label>
                        <input
                            autoComplete="given-name"
                            id="student-first-name"
                            required
                            value={form.firstName}
                            onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="student-email">Email</label>
                        <input
                            autoComplete="email"
                            id="student-email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="student-department">Department (optional)</label>
                        <input
                            id="student-department"
                            value={form.department}
                            onChange={(event) => setForm({ ...form, department: event.target.value })}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="student-skills">Skills, separated by commas (optional)</label>
                        <input
                            id="student-skills"
                            placeholder="Python, Data Analysis"
                            value={form.skills}
                            onChange={(event) => setForm({ ...form, skills: event.target.value })}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="student-interests">Research interests, separated by commas (optional)</label>
                        <input
                            id="student-interests"
                            value={form.interests}
                            onChange={(event) => setForm({ ...form, interests: event.target.value })}
                        />
                    </div>
                </div>
                <button className="submit-button" type="submit">Continue as student</button>
            </form>
            <p><Link className="text-link" to="/opportunities">Browse opportunities</Link></p>
        </section>
    );
}

export default LoginPage;
