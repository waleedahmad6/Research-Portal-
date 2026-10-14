function SearchBar({ value, onChange }) {
    return (
        <div className="search-field">
            <label htmlFor="opportunity-search">Search opportunities</label>
            <input
                id="opportunity-search"
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search titles, faculty, skills..."
                autoComplete="off"
            />
        </div>
    );
}

export default SearchBar;
