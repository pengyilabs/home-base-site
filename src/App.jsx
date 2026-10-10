import { useEffect, useMemo, useState } from "react";

function Cell({ value }) {
  if (value === null || value === undefined || value === "") {
    return <span className="muted">—</span>;
  }

  const attachments = Array.isArray(value) ? value : [value];
  if (attachments.every((v) => v && typeof v === "object" && v.type === "attachment")) {
    return (
      <span className="thumbs">
        {attachments.map((file) => (
          <img key={file.url} className="thumb" src={file.url} alt={file.name} loading="lazy" />
        ))}
      </span>
    );
  }

  if (typeof value === "object") return <span className="muted">{JSON.stringify(value)}</span>;
  return <span>{String(value)}</span>;
}

export default function App() {
  const [tables, setTables] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/records")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setTables(data);
        setActiveId(data[0]?.id ?? null);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/records?table=${encodeURIComponent(activeId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setRecords(data);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const columns = useMemo(() => {
    const names = new Set();
    for (const record of records) {
      for (const name of Object.keys(record.fields)) names.add(name);
    }
    return [...names];
  }, [records]);

  return (
    <div className="page">
      <header className="header">
        <h1>Home Base</h1>
        <p className="subtitle">
          Live data read from Feishu — no account required. Skeleton build; layout comes next.
        </p>
      </header>

      {tables.length > 0 && (
        <nav className="tabs">
          {tables.map((table) => (
            <button
              key={table.id}
              type="button"
              className={table.id === activeId ? "tab tab-active" : "tab"}
              onClick={() => setActiveId(table.id)}
            >
              {table.name}
            </button>
          ))}
        </nav>
      )}

      {error && <div className="error">{error}</div>}

      <main className="content">
        {loading && <p className="muted">Loading…</p>}

        {!loading && !error && records.length === 0 && (
          <p className="muted">No records in this table.</p>
        )}

        {!loading && records.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((name) => (
                    <th key={name}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {columns.map((name) => (
                      <td key={name}>
                        <Cell value={record.fields[name]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="footer">
        {records.length > 0 && <span>{records.length} records</span>}
      </footer>
    </div>
  );
}