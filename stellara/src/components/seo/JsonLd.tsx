/**
 * Renders a JSON-LD structured data script tag.
 *
 * Usage:
 *   <JsonLd data={generateWebsiteSchema()} />
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}
