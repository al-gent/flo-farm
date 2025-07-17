import { marked } from 'marked';
import DOMPurify from 'dompurify';

const FarmerNote = ({ farmersNote }) => {
  // Process and sanitize the markdown
  const processedNote = farmersNote ? DOMPurify.sanitize(marked(farmersNote)) : '';
  
  return (
    <div>
      {farmersNote && (
        <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <p className="text-secondary font-medium" style={{ marginBottom: '1rem' }}>
            <em>Farmer's Note:</em>
          </p>
          <div
            style={{ 
              fontSize: 'var(--font-size-lg)', 
              lineHeight: 'var(--line-height-relaxed)',
              color: 'var(--color-text-primary)'
            }}
            dangerouslySetInnerHTML={{ __html: processedNote }}
          />
        </div>
      )}
    </div>
  );
};

export default FarmerNote