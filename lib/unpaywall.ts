import { UnpaywallPaper } from './types';

/**
 * Searches for open access papers on Unpaywall using DOIs
 * @param query Search query - will be used to search other APIs first to get DOIs
 * @param maxResults Maximum number of results to return (default: 10)
 * @returns Array of paper objects
 */
export async function searchUnpaywall(dois: string[], email: string): Promise<UnpaywallPaper[]> {
  console.log('🔎 Unpaywall: Starting search', { doiCount: dois.length });
  
  if (!email) {
    console.error('❌ Unpaywall: Email is required for API access');
    return [];
  }
  
  if (dois.length === 0) {
    console.log('⚠️ Unpaywall: No DOIs provided for search');
    return [];
  }
  
  // For tracking
  let successCount = 0;
  let failureCount = 0;
  
  // Process DOIs in parallel with reasonable concurrency
  const papers = await Promise.all(
    dois.map(async (doi): Promise<UnpaywallPaper | null> => {
      try {
        // Clean the DOI
        const cleanDoi = doi.replace(/^https?:\/\/doi.org\//, '');
        const url = `https://api.unpaywall.org/v2/${encodeURIComponent(cleanDoi)}?email=${encodeURIComponent(email)}`;
        
        console.log('🌐 Unpaywall: Requesting DOI', { doi: cleanDoi });
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('❌ Unpaywall: API request failed', { 
            doi: cleanDoi, 
            status: response.status 
          });
          failureCount++;
          return null;
        }
        
        const data = await response.json();
        
        // Skip if no useful data
        if (!data.title) {
          console.log('⚠️ Unpaywall: No useful data for DOI', { doi: cleanDoi });
          failureCount++;
          return null;
        }
        
        // Check if open access version is available
        const isOpenAccess = data.is_oa || false;
        const bestOaLocation = data.best_oa_location || {};
        const pdfUrl = bestOaLocation.url_for_pdf || bestOaLocation.url || null;
        
        // Construct authors array
        const authors = data.z_authors?.map((author: any) => 
          `${author.given || ''} ${author.family || ''}`.trim()
        ) || ['Unknown Author'];
        
        // Extract journal info
        const journal = data.journal_name || 'Unknown Journal';
        
        // Extract publication date
        const published = data.published_date || 'Unknown Date';
        
        // Create paper object
        const paper: UnpaywallPaper = {
          title: data.title || 'Untitled',
          summary: data.abstract || 'No abstract available',
          url: data.doi_url || `https://doi.org/${cleanDoi}`,
          authors,
          published,
          journal,
          source: 'unpaywall',
          doi: cleanDoi,
          openAccess: isOpenAccess,
          pdfUrl: pdfUrl
        };
        
        successCount++;
        return paper;
      } catch (error) {
        console.error('❌ Unpaywall: Error processing DOI', error);
        failureCount++;
        return null;
      }
    })
  );
  
  // Filter out nulls (failed requests)
  const validPapers = papers.filter((paper): paper is UnpaywallPaper => paper !== null);
  
  console.log('✅ Unpaywall: Search completed', { 
    successCount,
    failureCount,
    totalRequested: dois.length,
    returnedResults: validPapers.length
  });
  
  return validPapers;
} 