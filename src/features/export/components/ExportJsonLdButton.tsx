import { Download } from 'lucide-react';
import { useSolutionStore } from '../../../store/solutionStore';
import { useHubStore } from '../../../store/hubStore';
import { solutionsToJsonLd } from '../utils/solution-to-json-ld';
import { saveJsonLdToFile } from '../utils/save-json-ld';

interface ExportJsonLdButtonProps {
  className?: string;
}

export function ExportJsonLdButton({ className = '' }: ExportJsonLdButtonProps) {
  const { solutions } = useSolutionStore();
  const { activeHubId } = useHubStore();

  const handleExport = () => {
    if (!activeHubId) {
      console.error('No active hub selected');
      return;
    }

    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-') // Replace colons and periods with hyphens
      .replace('T', '-')     // Replace T with hyphen
      .replace('Z', '');     // Remove Z suffix
    
    const filename = `solution-map-${activeHubId}-${timestamp}.jsonld`;
    const jsonLdData = solutionsToJsonLd(solutions);
    saveJsonLdToFile(jsonLdData, filename);
  };

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${className}`}
    >
      <Download className="w-4 h-4" />
      Export JSON-LD
    </button>
  );
} 