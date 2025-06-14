# Changelog

All notable changes to the timesheet.io Zapier Integration will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with 100+ tests covering all resources and actions
- Detailed documentation in README.md
- JSDoc comments for better code documentation
- CHANGELOG.md for tracking version history

### Changed
- Updated test structure to follow Zapier best practices
- Improved error handling in webhook operations
- Enhanced documentation for all features

## [1.3.0] - 2024-XX-XX

### Changed
- Updated to Zapier Platform Core 16.5.0
- Updated Node.js requirement to >= 22.13.1
- Updated npm requirement to >= 10.9.2
- Improved samples and examples

### Fixed
- Authentication validation issues
- Error handling in OAuth2 flow
- JSON parsing in API calls

## [1.2.2] - 2024-XX-XX

### Added
- Date range choices for report generation
- Custom date range support in reports

### Changed
- Improved report generation with more flexible date options

### Fixed
- Report date handling issues

## [1.2.0] - 1.2.1

### Added
- Send Report action with customizable fields
- Export to Excel (.xlsx) and CSV formats
- Field selection for reports (30+ available fields)
- Data summarization options

### Changed
- Enhanced report filtering options
- Improved date range selection

## [1.1.0] - 1.1.x

### Added
- Webhook support for all resources
- Real-time triggers for new items
- Search operations for all resources
- Dynamic field support based on user context

### Changed
- Migrated from polling to webhook-based triggers
- Improved performance with webhook subscriptions

## [1.0.0] - Initial Release

### Added
- OAuth2 authentication with refresh token support
- Basic CRUD operations for all resources:
  - Teams: Create, Read, List, Search
  - Projects: Create, Read, List, Search (with team assignment)
  - Tasks: Create, Read, List, Search (with time tracking)
  - Rates: Create, Read, List, Search
  - Tags: Create, Read, List, Search
- Pagination support for all list operations
- Error handling and validation
- Sample data for testing

### Technical Details
- Built with Zapier Platform Core
- Supports Node.js 18.x and above
- Comprehensive test coverage
- Production-ready error handling

## Migration Guide

### Upgrading to 1.3.0
1. Update Node.js to version 22.13.1 or higher
2. Update npm to version 10.9.2 or higher
3. Run `npm install` to update dependencies
4. Test your integration thoroughly as the platform core has been updated

### Upgrading to 1.2.x
- No breaking changes
- New report features are backward compatible
- Consider implementing the new date range options in your Zaps


For more information about specific versions, please refer to the [GitHub Releases](https://github.com/timesheetIO/ts-integration-zapier/releases) page.
