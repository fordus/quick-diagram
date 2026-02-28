# Quick Diagram

The fastest way to create beautiful diagrams — just describe what you want to any AI, get a JSON, and paste it in.

Perfect for rapid documentation, architecture overviews, presentations, and anything where you need a clear visual in seconds.

## How it works

1. Click **Schema** to copy the JSON spec to your clipboard
2. Paste it into any AI (Claude, ChatGPT, etc.) and describe the diagram you need
3. Copy the generated JSON and import it — your diagram appears instantly

No drag-and-drop marathon. No manual alignment. Just describe → generate → done.

## Features

- **JSON-driven** — define your entire diagram as a clean JSON structure
- **8 node types** — process, decision, database, service, pipeline, input, output, and text
- **Clusters** — group related nodes into labeled sections
- **Auto-layout** — topological algorithm arranges nodes in logical layers automatically
- **Live sync** — edit visually or via JSON; both stay in sync
- **50+ icons** — Lucide icon library built in, assignable per node
- **Custom styling** — border colors, background colors, dashed borders per node
- **Animated edges** — connections can be animated or dashed
- **Export as PNG** — download your diagram as an image
- **Dark / light theme** — works in both

## JSON Schema

```json
{
  "nodes": [
    {
      "id": "string",
      "type": "process | decision | database | service | pipeline | input | output | text",
      "label": "string",
      "description": "string (optional)",
      "icon": "lucide-icon-name (optional)",
      "cluster": "cluster-id (optional)",
      "tags": ["string"],
      "borderColor": "#hex (optional)",
      "bgColor": "#hex (optional)",
      "dashedBorder": false
    }
  ],
  "connections": [
    {
      "from": "node-id",
      "to": "node-id",
      "label": "string (optional)",
      "animated": false,
      "dashed": false
    }
  ],
  "clusters": [
    {
      "id": "string",
      "name": "string",
      "color": "#hex (optional)",
      "dashedBorder": false
    }
  ]
}
```

## Installation

```bash
git clone https://github.com/fordus/quick-diagram.git
cd quick-diagram
pnpm install
pnpm dev
```

## Tech stack

- Next.js 16 + React 19 + TypeScript
- React Flow — canvas and node rendering
- Tailwind CSS + Radix UI
- Lucide icons
- html-to-image — PNG export

## License

MIT
