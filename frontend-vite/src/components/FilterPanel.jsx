function FilterPanel({
    paid,
    mode,
    skills,
    availableSkills,
    deadline,
    onPaidChange,
    onModeChange,
    onSkillsChange,
    onDeadlineChange,
    activeFilterCount,
    onClear
}) {
    const toggleSkill = (skill) => {
        onSkillsChange(
            skills.includes(skill)
                ? skills.filter((selected) => selected !== skill)
                : [...skills, skill]
        );
    };

    return (
        <section className="filter-panel" aria-label="Filter opportunities">
            <div className="filter-panel-heading">
                <div>
                    <h3>Filters</h3>
                    <span className="filter-count" aria-live="polite">
                        {activeFilterCount} active
                    </span>
                </div>
                <button
                    className="text-button"
                    type="button"
                    onClick={onClear}
                    disabled={activeFilterCount === 0}
                >
                    Clear all filters
                </button>
            </div>

            <div className="filter-controls">
                <div className="filter-group">
                    <label htmlFor="paid-filter">Compensation</label>
                    <select
                        id="paid-filter"
                        value={paid}
                        onChange={(event) => onPaidChange(event.target.value)}
                    >
                        <option value="">Paid or unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="mode-filter">Location</label>
                    <select
                        id="mode-filter"
                        value={mode}
                        onChange={(event) => onModeChange(event.target.value)}
                    >
                        <option value="">Any location</option>
                        <option value="remote">Remote</option>
                        <option value="on-campus">On-campus</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="deadline-filter">Deadline</label>
                    <select
                        id="deadline-filter"
                        value={deadline}
                        onChange={(event) => onDeadlineChange(event.target.value)}
                    >
                        <option value="any">Any deadline</option>
                        <option value="7">Next 7 days</option>
                        <option value="30">Next 30 days</option>
                    </select>
                </div>
            </div>

            {availableSkills.length > 0 && (
                <fieldset className="skill-filter">
                    <legend>Skills</legend>
                    <div className="skill-options">
                        {availableSkills.map((skill) => (
                            <label className="skill-option" key={skill}>
                                <input
                                    type="checkbox"
                                    checked={skills.includes(skill)}
                                    onChange={() => toggleSkill(skill)}
                                />
                                <span>{skill}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}
        </section>
    );
}

export default FilterPanel;
