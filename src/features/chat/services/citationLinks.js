const SOURCES_SECTION_HEADER = '\n---\n**Fonti**\n';
const SOURCE_ENTRY_PATTERN = /^-\s+\[(S\d+)]\s+\[[^\]]+\]\((https?:\/\/[^\s)]+)\)$/gm;
const INLINE_CITATION_PATTERN = /\[(S\d+)](?!\()/g;

export function linkInlineCitations(content) {
  const sourcesSectionIndex = content.indexOf(SOURCES_SECTION_HEADER);
  if (sourcesSectionIndex === -1) return content;

  const answer = content.slice(0, sourcesSectionIndex);
  const sourcesSection = content.slice(sourcesSectionIndex);
  const sourceUrls = extractSourceUrls(sourcesSection);

  return answer.replace(INLINE_CITATION_PATTERN, (citation, label) => {
    const sourceUrl = sourceUrls.get(label);
    return sourceUrl ? `[${label}](${sourceUrl})` : citation;
  }) + sourcesSection;
}

export function countSources(content) {
  const sourcesSectionIndex = content.indexOf(SOURCES_SECTION_HEADER);
  if (sourcesSectionIndex === -1) return 0;
  return extractSourceUrls(content.slice(sourcesSectionIndex)).size;
}

function extractSourceUrls(sourcesSection) {
  const sourceUrls = new Map();
  for (const entry of sourcesSection.matchAll(SOURCE_ENTRY_PATTERN)) {
    sourceUrls.set(entry[1], entry[2]);
  }
  return sourceUrls;
}
