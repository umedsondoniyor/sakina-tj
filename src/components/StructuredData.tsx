import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

function safeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{safeJson(data)}</script>
    </Helmet>
  );
}
