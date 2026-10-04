import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Database, Download, RefreshCw } from 'lucide-react';
import { getDatasetDownloadUrl, getDatasets } from '../services/api';

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DatasetLibrary() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshDatasets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDatasets(await getDatasets());
    } catch {
      setError('Could not load the dataset catalog. Check the API and RDS connection, then retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    getDatasets()
      .then((items) => {
        if (mounted) setDatasets(items);
      })
      .catch(() => {
        if (mounted) setError('Could not load the dataset catalog. Check the API and RDS connection, then retry.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="dataset-library" aria-labelledby="dataset-library-title">
      <div className="dataset-library__heading">
        <div>
          <p className="section-kicker">AWS DATA CATALOG</p>
          <h2 id="dataset-library-title">Research datasets.</h2>
          <p className="dataset-library__note">Metadata in RDS. Private source files in S3.</p>
        </div>
        <button className="dataset-library__refresh" type="button" onClick={refreshDatasets} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'dataset-library__spin' : ''} />
          Refresh catalog
        </button>
      </div>

      {error && <p className="dataset-library__message dataset-library__message--error" role="alert"><AlertCircle size={16} />{error}</p>}
      {!error && !loading && datasets.length === 0 && (
        <p className="dataset-library__message"><Database size={16} />No datasets have been imported yet.</p>
      )}
      {loading && <p className="dataset-library__message" role="status">Loading dataset catalog…</p>}
      {datasets.length > 0 && (
        <div className="dataset-library__grid">
          {datasets.map((dataset) => (
            <article className="dataset-card" key={dataset.id}>
              <div className="dataset-card__top">
                <span className="dataset-card__type">{dataset.type}</span>
                <span className="dataset-card__size">{formatBytes(dataset.sizeBytes)}</span>
              </div>
              <h3>{dataset.title}</h3>
              <p>{dataset.license}</p>
              <div className="dataset-card__footer">
                <a href={dataset.sourceUrl} target="_blank" rel="noreferrer">Dataset source</a>
                <a className="dataset-card__download" href={getDatasetDownloadUrl(dataset.id)}>
                  <Download size={14} /> Download
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
