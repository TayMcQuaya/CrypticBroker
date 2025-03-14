# CrypticBroker Database Schema

This document explains the database schema for the CrypticBroker application. Our schema is designed to be flexible, particularly around the form system, allowing for changes to forms without requiring database schema modifications.

## Core Entities

### User
- Represents a user of the platform
- Can have different roles (admin, project owner, investor, accelerator)
- Can be a member of multiple organizations
- Can own projects and submit forms

### Organization
- Represents an entity like a VC firm, accelerator, or project team
- Has members (users) with different roles
- Can receive applications (as a VC or accelerator)
- Can send applications (as a project team)

### Project
- Represents a blockchain/crypto project
- Owned by a user
- Can have multiple applications to different organizations
- Has related form submissions

## Form System

Our form system is designed to be dynamic and flexible:

### Form
- Represents a form template (e.g., "Token Project Onboarding Form")
- Has a version number to track changes over time
- Contains a JSON structure for more flexibility
- Organized into sections with questions

### FormSection
- A logical group of questions within a form
- Has an order property to determine display sequence
- Contains multiple questions

### FormQuestion
- An individual question within a section
- Has a type (text, select, checkbox, etc.)
- Can have options for select/checkbox/radio types
- Has properties for validation (required, etc.)

### FormSubmission
- Represents a completed form by a user
- Contains JSON data with all the form answers
- Records which version of the form was used
- Can have AI-generated scores and notes
- Can be associated with a project and applications

## Application Process

### Application
- Represents a project's application to an organization (VC, accelerator)
- Links a project with a form submission
- Has a status to track progress (draft, submitted, reviewing, etc.)
- Contains notes for internal communication

## Relationships

- A User can be a member of multiple Organizations
- A User can own multiple Projects
- A Project can have multiple Applications to different Organizations
- A FormSubmission is created by a User for a specific Form
- An Application links a Project, FormSubmission, and target Organization

## Flexibility Features

- Form structure is stored as JSON, allowing for easy modifications
- FormSubmission data is stored as JSON, preserving the exact questions and answers
- Form versioning ensures historical submissions remain valid even as forms change

This schema supports our key requirements:
1. Multiple user roles with appropriate permissions
2. Flexible form management with versioning
3. Comprehensive application tracking
4. Organization-based access control 