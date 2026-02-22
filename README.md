# Eclipse Project

Eclipse is a modern, AI-powered search application. It integrates [SearXNG](https://searxng.github.io/searxng/) (privacy-focused meta search engine) with [OLLAMA](https://ollama.ai/) (local LLM) to provide intelligent search results enhanced with large language model processing.

---

**This project is fully open source, licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).**

Contributions, forks, and public deployments are welcome!

**Author:** Yash

## Features

- 🔍 **Privacy-First Search**: Built on SearXNG for privacy-respecting meta-search
- 🧠 **AI-Powered Results**: Integration with OLLAMA for local LLM processing
- 📊 **Rich Components**: 
  - AI-generated result cards
  - Knowledge stacks
  - Stock widgets
  - Interactive maps
  - Calculator widget
  - Citation tracking
- 🎨 **Modern UI**: Built with Next.js, React, Tailwind CSS, and Framer Motion
- 🚀 **Fast & Responsive**: Optimized performance with streaming and virtual scrolling
- 🐳 **Docker Support**: Easy deployment with Docker and Docker Compose

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, CSS-in-JS with Framer Motion
- **Backend Services**: 
  - SearXNG (meta search engine)
  - OLLAMA (local LLM)
- **Infrastructure**: Docker, Docker Compose
- **Libraries**: 
  - react-markdown (with KaTeX math support)
  - Leaflet (maps)
  - Recharts (visualizations)
  - Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 18+ (for development)
- Docker and Docker Compose (for containerized setup)
- OLLAMA running locally (for LLM features)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eclipse.git
   cd eclipse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Setup

The entire Eclipse application (app + SearXNG) can be run with Docker Compose:

1. **Start all services**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - App: http://localhost:3000
   - SearXNG: http://localhost:8081

3. **Stop services**
   ```bash
   docker-compose down
   ```

### Environment Variables

Create a `.env.local` file in the `eclipse` directory:

```env
# Switch between 'groq' or 'ollama'
AI_PROVIDER=groq

# Groq (fast, cloud)
GROQ_API_KEY=your api key here
GROQ_MODEL=llama-3.1-8b-instant

# Ollama (local, private)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral:latest

# Always used
SEARXNG_URL=http://localhost:8081

```

## Project Structure

```
eclipse/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── search/         # Search endpoint
│   │   ├── stock/          # Stock data endpoint
│   │   ├── generate-card/  # AI card generation
│   │   └── generate-stack-card/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css
├── components/             # React components
│   ├── AIResult.tsx
│   ├── ArchivePage.tsx
│   ├── BottomSearch.tsx
│   ├── CalculatorWidget.tsx
│   ├── Citation.tsx
│   ├── CognitivePath.tsx
│   ├── GenerativeCard.tsx
│   ├── InlineAskPanel.tsx
│   ├── KnowledgeStack.tsx
│   ├── MagneticButton.tsx
│   ├── NearbyMap.tsx
│   ├── ResearchProcess.tsx
│   ├── StockWidget.tsx
│   └── ...
├── lib/                    # Utility functions
│   ├── ai-provider.ts
│   ├── calculator.ts
│   ├── search.ts
│   ├── stock.ts
│   ├── map.ts
│   └── ...
├── public/                 # Static assets
├── Dockerfile
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## Usage

### Basic Search

1. Enter your search query in the search bar
2. Results are fetched from SearXNG
3. AI processes results and generates insights

### Available Widgets

- **AI Result Cards**: AI-generated summaries of search results
- **Knowledge Stack**: Organized information cards
- **Stock Widget**: Real-time stock information
- **Calculator**: Interactive math calculations
- **Maps**: Geolocation-based results

## API Routes

- `POST /api/search` - Perform a search query
- `POST /api/generate-card` - Generate AI result cards
- `POST /api/generate-stack-card` - Generate knowledge stack cards
- `GET /api/stock` - Get stock information

## Contributing

I welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Roadmap

- [ ] Enhanced caching strategies
- [ ] Advanced result filtering
- [ ] Custom theme support
- [ ] Multi-language support
- [ ] WebSocket real-time updates
- [ ] Result export (PDF, JSON)
- [ ] Browser extension

## Troubleshooting

### OLLAMA Connection Issues
- Ensure OLLAMA is running: `ollama serve`
- Check the `OLLAMA_URL` environment variable
- Default: `http://localhost:11434`

### SearXNG Not Responding
- Verify SearXNG is running: `docker-compose ps`
- Check Docker logs: `docker-compose logs searxng`

### Build Errors


## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

If you modify or deploy this software as a service, you must make the complete corresponding source code available under the same license.

## Support


## Acknowledgments



If you modify or deploy this software as a service, you must make the complete corresponding source code available under the same license.
