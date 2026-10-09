# SocialCalc AI Editor

An advanced web-based spreadsheet editor powered by AI capabilities, built on top of the SocialCalc JavaScript engine with cloud storage, multi-sheet workbooks, and intelligent agents for natural language spreadsheet manipulation.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | SocialCalc JS Engine, jQuery, Highcharts, Jinja2 |
| Backend | Python Flask 3.0.3, Gunicorn |
| Database | MongoDB Atlas (pymongo) |
| AI/LLM | Google Gemini (`google-generativeai`), Claude via AWS Bedrock |
| Cloud Storage | AWS S3 (boto3) |
| PDF Generation | pdfkit / WeasyPrint |
| Deployment | Docker, docker-compose, AWS EC2 |

---

## Architecture

```
                    +---------------------------+
                    |     Browser (Frontend)     |
                    |  SocialCalc JS Engine      |
                    |  jQuery + Highcharts       |
                    +---------------------------+
                              |
                     HTTP / REST API
                              |
                    +---------------------------+
                    |   Flask Backend (main.py)  |
                    |                           |
                    |  Route Handlers:           |
                    |  - Auth (Login/Register)   |
                    |  - Save/Load Files         |
                    |  - Lists Management        |
                    |  - Import/Export           |
                    |  - AI Agent APIs           |
                    +---------------------------+
                       /        |        \
                      /         |         \
          +----------+  +------+------+  +----------+
          | MongoDB  |  | AI Agents   |  | AWS S3   |
          | Atlas    |  |             |  | Storage  |
          +----------+  +------+------+  +----------+
                               |
                    +----------+----------+
                    |          |          |
              Sheet Agent  Command   MCP Agent
              (Gemini)     Agent    (Bedrock +
                          (Gemini)  socialcalc-mcp)
```

### Core Components

#### Backend (`main.py`)

The Flask application defines all routes and delegates to handler classes. Routes are organized into:

- **Authentication** - Login, register, password reset, logout
- **File Operations** - Save, load, download, import/export
- **Lists API** - Create/delete lists, move files between lists
- **Bulk Operations** - Multi-file upload/download/delete
- **AI Agent APIs** - Three separate agent systems (see below)

#### Route Handlers (`route_handlers/`)

Each handler is a stateless class with static `get()`/`post()` methods:

| Handler | Purpose |
|---------|---------|
| `Auth/UserLoginHandler` | Email/password login with Flask sessions |
| `Auth/UserRegisterHandler` | User registration with passlib hashing |
| `Auth/UserLostPasswordHandler` | Password reset flow |
| `Auth/AuthApiHandler` | JSON API auth for mobile app (BloodSugarLog) |
| `SaveHandler` | Save spreadsheet MSC data to MongoDB |
| `HomeHandler` | Render main editor page |
| `ListHandler` | CRUD for file lists/folders |
| `BulkHandler` | Bulk upload/download/delete operations |
| `ImportHandler` | Excel/CSV file import |
| `DownloadFileHander` | Export to XLSX/XLS/CSV/PDF/HTML |
| `McpAgentHandler` | Real-time MCP agent with streaming SSE |
| `AppAgentHandler` | Blood Sugar Log cloud agent with IPFS |

#### Cloud Storage (`cloud/`)

- **`storage/storage.py`** - MongoDB operations: `getFile`, `saveFile`, `listUserFiles`, `listUserFilesOptimized`, `deleteFile`, `moveFile`
- **`authenticate/`** - User auth: `user_exists`, `create_user`, `authenticate_user` using passlib

#### AI Agent Systems

##### 1. Sheet Agent (`sheet_agent/agent/`)

Generates MSC (Multi-Sheet Content) code from natural language using Google Gemini. Uses a RAG (Retrieval Augmented Generation) system (`SyntaxRAG`) that indexes SocialCalc MSC syntax documentation to provide relevant context to the LLM.

- `AgentHandler` - Chat-based MSC generation
- `AppMappingHandler` - Structured app mapping generation (one-shot)

##### 2. Command Agent (`command_agent/`)

Generates executable SocialCalc commands from natural language. The commands run directly in the browser's SocialCalc engine.

- Uses `COMMAND_REFERENCE.md` as its knowledge base (complete command syntax documentation)
- `CommandValidator` validates generated commands through `pipeline-code/validator.js` (Node.js)
- Supports multi-turn conversation with session memory

##### 3. MCP Agent (`route_handlers/McpAgentHandler.py`)

Real-time spreadsheet editing agent using Claude (via AWS Bedrock) and the socialcalc-mcp server:

- Launches the MCP server as a subprocess (stdio JSON-RPC)
- Streams responses via Server-Sent Events (SSE)
- Multi-turn tool execution loop (up to 15 turns)
- Streams intermediate sheet state after each modifying tool call
- Returns final updated workbook state

#### Frontend

- **`static/socialcalc/`** - Core SocialCalc JS engine (multi-sheet, formula engine, table editor)
- **`static/app/`** - Application JS (toolbar, agent panels, file management modals)
- **`templates/importcollabload.html`** - Main editor template
- **`static/vendor/`** - jQuery, Highcharts, xlsx.js

---

## Code Structure

```
Socialcalc-AI/
├── main.py                          # Flask app entry point, all routes
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variable template
├── Dockerfile                       # Python 3.11-slim, gunicorn
├── docker-compose.yml               # Single-service compose
├── deploy.sh                        # AWS EC2 deployment script
├── run.sh                           # Local dev launcher
│
├── route_handlers/                  # Flask route handler classes
│   ├── Auth/                        # Authentication handlers
│   │   ├── UserLoginHandler.py
│   │   ├── UserRegisterHandler.py
│   │   ├── UserLostPasswordHandler.py
│   │   ├── UserLogoutHandler.py
│   │   ├── PWResetHandler.py
│   │   └── AuthApiHandler.py        # JSON API auth (mobile)
│   ├── SaveHandler.py
│   ├── HomeHandler.py
│   ├── ListHandler.py
│   ├── BulkHandler.py
│   ├── ImportHandler.py
│   ├── DownloadFileHander.py
│   ├── HTMLToPDFHandler.py
│   ├── UserSheetHandler.py
│   ├── McpAgentHandler.py           # MCP real-time agent
│   └── AppAgentHandler.py           # Blood sugar cloud agent + IPFS
│
├── cloud/                           # Storage & auth abstractions
│   ├── storage/storage.py           # MongoDB file operations
│   └── authenticate/                # User authentication
│       ├── authenticate.py
│       └── user.py
│
├── sheet_agent/                     # AI MSC generation agent
│   └── agent/
│       ├── handler.py               # AgentHandler, AppMappingHandler
│       └── rag_utils.py             # SyntaxRAG for MSC context
│
├── command_agent/                   # Command generation agent
│   ├── handler.py                   # CommandAgentHandler, CommandValidator
│   └── COMMAND_REFERENCE.md         # Complete SocialCalc command docs
│
├── pipeline-code/                   # Command validation pipeline
│   └── validator.js                 # Node.js command validator
│
├── static/                          # Frontend assets
│   ├── socialcalc/                  # Core SocialCalc JS engine
│   │   └── core/
│   │       ├── socialcalc-3.js      # Main engine
│   │       └── socialcalctableeditor.js
│   ├── app/                         # Application JavaScript
│   └── vendor/                      # Third-party libraries
│
├── templates/                       # Jinja2 HTML templates
│   └── importcollabload.html        # Main editor page
│
├── excelinterop/                    # Excel import/export utilities
│
├── Socialcalc-MCP/                  # MCP server sub-project (TypeScript)
└── BloodSugarLog/                   # Mobile app sub-project (Ionic/React)
```

---

## Setup

### Prerequisites

- Python 3.8+
- Node.js 18+ (for command validator and MCP server)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (for sheet/command agents)
- AWS credentials (for S3 storage and Bedrock AI)

### Installation

```bash
# Clone the repository
git clone https://github.com/anisharma07/Socialcalc-AI.git
cd Socialcalc-AI

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Flask session secret key |
| `APP_TITLE` | Application title displayed in UI |
| `MONGO_URI` | MongoDB Atlas connection string |
| `MONGO_DB` | MongoDB database name |
| `GEMINI_API_KEY` | Google Gemini API key |
| `AWS_ACCESS_KEY_ID` | AWS access key (S3 + Bedrock) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | AWS region (default: us-east-1) |
| `S3_BUCKET_NAME` | S3 bucket for file storage |
| `PINATA_JWT` | Pinata IPFS JWT (for blood sugar agent) |

### Running Locally

```bash
# Start the development server (port 5001)
source .venv/bin/activate
python3 main.py

# Or use the helper script
./run.sh
```

### Running with Docker

```bash
# Build and start (production, port 80)
docker-compose up -d --build

# Using the deploy helper
./deploy.sh up
```

### Setting Up the MCP Agent

The MCP agent requires the Socialcalc-MCP server:

```bash
cd Socialcalc-MCP
npm install
npm run build
# The McpAgentHandler will automatically find dist/index.js
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/login` | User login |
| GET/POST | `/register` | User registration |
| GET/POST | `/logout` | Logout |
| GET/POST | `/lostpw` | Lost password |
| GET/POST | `/pwreset` | Password reset |

### File Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/save` | Save spreadsheet |
| POST | `/usersheet` | Load user sheet |
| POST | `/downloadfile` | Export file |
| GET/POST | `/import` | Import file |
| GET/POST | `/htmltopdf` | HTML to PDF conversion |

### Lists API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/list/create` | Create new list |
| POST | `/list/delete` | Delete list |
| POST | `/list/move` | Move file between lists |

### Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/list-files` | List files in a list |
| POST | `/api/bulk-download` | Download multiple files |
| POST | `/api/bulk-upload` | Upload multiple files |
| POST | `/api/bulk-delete` | Delete multiple files |
| POST | `/api/check-duplicates` | Check for duplicate filenames |

### AI Agent - Sheet Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agent/models` | List available models |
| POST | `/api/agent/session` | Create agent session |
| POST | `/api/agent/chat` | Chat with agent |
| POST | `/api/agent/credentials` | Update API credentials |
| GET | `/api/agent/history` | Get session history |
| POST | `/api/agent/clear` | Clear session |

### AI Agent - Command Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agent/command/models` | List available models |
| POST | `/api/agent/command/session` | Create session |
| POST | `/api/agent/command/chat` | Chat with agent |
| POST | `/api/agent/command/validate` | Validate commands |
| POST | `/api/agent/command/record-execution` | Record execution result |
| GET | `/api/agent/command/reference` | Get command reference |

### AI Agent - MCP Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/mcp/session` | Create MCP session |
| POST | `/api/agent/mcp/chat` | Chat (returns SSE stream) |
| POST | `/api/agent/mcp/clear` | Clear session |

### App Agent (Blood Sugar Log)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/app-agent/credentials` | IPFS credentials CRUD |
| POST | `/api/app-agent/chat` | Agent chat + IPFS pin |
| GET | `/api/app-agent/reports` | List user reports |

### Auth API (Mobile)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (JSON) |
| POST | `/api/auth/login` | Login (JSON) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/status` | Check auth status |

---

## Database Schema

### MongoDB Collections

**File Storage** (directory-tree structure):
```
home/
└── [username]/
    ├── Default/
    │   ├── file1.msc    {_id, fname, type:"file", data:"MSC JSON", created_at, updated_at}
    │   └── ...
    └── Work/
        └── ...
```

**Documents:**
- `type: "directory"` - Has `fname`, `files` array of references
- `type: "file"` - Has `fname`, `data` (MSC JSON content), timestamps

**User IPFS Credentials** (`user_ipfs_credentials`):
```json
{
  "_id": "user_email",
  "ipfsPinataJwt": "...",
  "ipfsPinataApiKey": "...",
  "ipfsPinataApiSecret": "...",
  "ipfsGatewayUrl": "https://gateway.pinata.cloud/ipfs/",
  "updatedAt": "datetime"
}
```

**IPFS Reports** (`user_ipfs_reports`):
```json
{
  "userId": "user_email",
  "cid": "bafyrei...",
  "name": "Blood Sugar Report (2024-01-15)",
  "url": "https://gateway.pinata.cloud/ipfs/bafyrei...",
  "createdAt": "datetime"
}
```

---

## Data Flow

### Spreadsheet Editing
1. User edits cells in the SocialCalc JS engine (browser)
2. Engine maintains internal MSC (Multi-Sheet Content) representation
3. On save: MSC JSON sent to Flask `/save` endpoint
4. Flask stores in MongoDB under user's directory tree

### AI Agent (Command)
1. User sends natural language request
2. Command Agent (Gemini) generates SocialCalc commands
3. Commands validated through Node.js validator pipeline
4. Valid commands returned to browser
5. Browser executes commands in SocialCalc engine

### AI Agent (MCP Real-time)
1. User sends edit request via UI
2. Backend saves current sheet state to temp file
3. MCP server launched as subprocess (JSON-RPC over stdio)
4. Claude (Bedrock) iterates: reads sheet -> generates tool calls -> executes via MCP
5. Intermediate sheet states streamed via SSE to client
6. Final workbook state returned; client updates SocialCalc engine

---

## License

MIT
