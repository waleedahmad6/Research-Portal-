function SortDropdown({ value, onChange }) {
    return (
        <div className="sort-field">
            <label htmlFor="opportunity-sort">Sort by</label>
            <select
                id="opportunity-sort"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="newest">Newest</option>
                <option value="closing">Closing soon</option>
                <option value="relevant">Most relevant</option>
            </select>
        </div>
    );
}

export default SortDropdown;
