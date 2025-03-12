# Research Chat with Next.js

A Next.js application that provides a chat interface powered by OpenAI's API and integrates with multiple scholarly databases to provide relevant scientific paper information in responses.

## Features

- Uses OpenAI GPT-4 for chat completion with chain-of-thought reasoning
- Integrates with multiple scholarly databases:
  - **arXiv** - For preprints in physics, mathematics, computer science, and related fields
  - **PubMed** - For biomedical literature
  - **OpenAlex** - Comprehensive scholarly database with 240M+ works (CC0 license)
  - **Semantic Scholar** - 200M+ academic papers with semantic search capabilities
  - **CORE** - 210M+ open access research papers
  - **Unpaywall** - Database of 32M+ open access articles (finds free versions of papers)
- Question optimization for better scholarly search results
- Keyword extraction for targeted academic searches
- Clean and minimal UI with easy toggling between academic and standard chat modes

## Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key
- (Optional) API keys for additional scholarly databases

## Getting Started

1. Clone this repository:

```bash
git clone https://github.com/yourusername/research-chat-nextjs.git
cd research-chat-nextjs
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory based on the `.env.example` template:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```
# Required
OPENAI_API_KEY=your_actual_api_key_here

# Optional - for additional scholarly databases
ENABLE_UNPAYWALL=true
UNPAYWALL_EMAIL=your_email@example.com

ENABLE_CORE=true
CORE_API_KEY=your_core_api_key_here

# etc.
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to http://localhost:3000

## How It Works

1. The user types a question in the chat interface and can toggle between academic and standard modes
2. In academic mode:
   - The question is optimized for academic search using GPT-4
   - Keywords are extracted for better search results
   - The system searches multiple scholarly databases based on the optimized query
   - The results are combined, deduplicated, and ranked
   - DOIs are extracted and used to find open access versions via Unpaywall
   - The results are formatted and presented to GPT-4 along with the user's question
3. GPT-4 generates a response using chain-of-thought reasoning, incorporating information from the scholarly sources
4. The response and relevant paper references are displayed to the user

## Configuring Scholarly APIs

The application supports multiple scholarly APIs, all with open or CC0 licenses:

### Enabled by Default
- **arXiv**: No API key required
- **PubMed**: No API key required
- **OpenAlex**: No API key required (CC0 license)
- **Semantic Scholar**: No API key required, but provides higher rate limits with an API key

### Disabled by Default (Require Additional Setup)
- **Unpaywall**: Requires an email address
- **CORE**: Requires an API key from [CORE](https://core.ac.uk/services/api)

## Project Structure

- `pages/index.tsx`: The main chat UI component
- `pages/api/chat.ts`: Serverless API endpoint that handles the chat logic
- `lib/arxiv.ts`, `lib/pubmed.ts`, etc.: Utilities for querying various scholarly databases
- `lib/openai.ts`: Utilities for question optimization and keyword extraction
- `lib/types.ts`: Common type definitions

## License

MIT 