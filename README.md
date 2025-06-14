# timesheet.io Zapier Integration

[![Zapier Platform Version](https://img.shields.io/badge/zapier--platform--core-16.5.0-blue.svg)](https://github.com/zapier/zapier-platform)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.13.1-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Official Zapier integration for [timesheet.io](https://timesheet.io) - Connect your time tracking data with 5,000+ apps through Zapier.

## 📋 Features

### Triggers (Real-time via Webhooks)
- **New Team** - Triggers when a new team is created
- **New Project** - Triggers when a new project is added
- **New Task** - Triggers when a new task is created
- **New Rate** - Triggers when a new rate is defined
- **New Tag** - Triggers when a new tag is created

### Actions
- **Send Report** - Generate and send customized reports via email
- **Create Team** - Create a new team in your organization
- **Create Project** - Add a new project with optional team assignment
- **Create Task** - Log a new time entry with duration and project
- **Create Rate** - Define a new billing rate
- **Create Tag** - Create a new tag for categorization

### Search Operations
- Find teams, projects, tasks, rates, and tags by name or keyword

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.13.1
- npm >= 10.9.2
- Zapier CLI (`npm install -g zapier-platform-cli`)
- timesheet.io account with API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/timesheetIO/ts-integration-zapier.git
cd ts-integration-zapier
```

2. Install dependencies:
```bash
npm install
```

3. Set up authentication credentials:
```bash
export CLIENT_ID=your_client_id
export CLIENT_SECRET=your_client_secret
```

### Development

#### Running Tests
```bash
# Run all tests
npm test

# Run tests with environment variables
CLIENT_ID=your_client_id CLIENT_SECRET=your_client_secret npm test
```

#### Local Testing with Zapier CLI
```bash
# Test authentication
zapier test:auth

# Test a specific trigger
zapier test:trigger project

# Test a specific action
zapier test:action report
```

#### Deploying to Zapier

1. Login to Zapier platform:
```bash
zapier login
```

2. Push your integration:
```bash
zapier push
```

3. Promote a version:
```bash
zapier promote 1.0.0
```

## 📁 Project Structure

```
├── authentication.js    # OAuth2 authentication configuration
├── index.js            # Main app configuration and exports
├── creates/            # Action definitions
│   └── report.js       # Send Report action with date ranges and formats
├── resources/          # Resource definitions (triggers and actions)
│   ├── project.js      # Project resource with CRUD operations
│   ├── rate.js         # Rate resource management
│   ├── tag.js          # Tag resource operations
│   ├── task.js         # Task resource with time tracking
│   └── team.js         # Team resource with webhooks
├── test/               # Comprehensive test suite
│   ├── index.js        # Authentication tests
│   ├── creates/        # Action tests
│   └── resources/      # Resource-specific tests
└── build/              # Build output directory
```

## 🔐 Authentication

This integration uses OAuth2 with refresh token support:

1. Users authorize the app through timesheet.io's OAuth2 flow
2. The integration exchanges authorization codes for access tokens
3. Refresh tokens are automatically used when access tokens expire
4. All API requests include Bearer token authentication

### Required Environment Variables
- `CLIENT_ID` - OAuth2 client ID from timesheet.io
- `CLIENT_SECRET` - OAuth2 client secret from timesheet.io

## 📊 Report Generation

The Send Report action supports:

### Date Ranges
- Predefined: Today, This Week, Last Month, etc.
- Custom: Specify exact start and end dates

### Export Formats
- Excel (.xlsx)
- CSV (.csv)

### Field Selection
Choose from 30+ available fields including:
- Time data (date, duration, start/end times)
- Project and task information
- Billing details (rates, billable status)
- Tags and categories
- Custom fields

### Filters
- Task types: All, Tasks, Mileage, Calls
- Billing status: Billable, Not Billable, Paid, Unpaid
- Data summarization options

## 🧪 Testing

The test suite includes comprehensive coverage for:
- OAuth2 authentication flow
- All resource operations (CRUD + webhooks)
- Report generation with various configurations
- Error handling and edge cases
- Pagination and data filtering

### Test Structure
```javascript
describe('Resource Tests', () => {
  // Webhook operations
  // CRUD operations  
  // Search functionality
  // Dynamic fields
  // Sample data validation
});
```

## 🐛 Reporting Issues

Found a bug or have a feature request? Please [create an issue](https://github.com/timesheetIO/ts-integration-zapier/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Zapier CLI version
- Node.js version

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [timesheet.io API Documentation](https://api.timesheet.io/)
- [Zapier Platform Documentation](https://platform.zapier.com/docs)
- [Zapier CLI Reference](https://platform.zapier.com/cli_docs/docs)

## 👥 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/timesheetIO/ts-integration-zapier/issues)
- **timesheet.io Support**: support@timesheet.io
- **Zapier Support**: [Zapier Help Center](https://help.zapier.com)

---

Made with ❤️ by the timesheet.io team
