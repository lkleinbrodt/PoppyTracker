# Poppy's Food Tracker: App Design Document

## Overview

Poppy's Food Tracker is a React Native mobile application built with Expo for iOS that helps track how much dog food has been given to Poppy each day. The app features a simple, cute interface with a Poppy theme and stores feeding history in device storage.

## Core Features

1. ✅ **Daily Feeding Tracker**: Record and adjust the amount of food (in cups) given to Poppy
2. ✅ **Visual Progress Indicator**: Cup icons showing feeding progress
3. ✅ **History View**: Access past feeding records
4. ✅ **Local Storage**: Store feeding data on the device
5. ⏳ **API Integration**: Future capability to sync with backend (routes to be implemented later)

## Tech Stack

- ✅ **Framework**: React Native
- ✅ **Development Platform**: Expo
- ✅ **Navigation**: Expo Router
- ✅ **Target Platform**: iOS
- ✅ **Storage**: AsyncStorage (React Native's local storage solution)
- ✅ **State Management**: React Context API
- ✅ **UI Components**: Custom components with React Native

## App Structure

### Screens

1. ✅ **Home Screen** - Main interface to track daily feeding
2. ✅ **History Screen** - View past feeding records

### Navigation

- ✅ Tab-based navigation between Home and History screens
- ✅ Header with Poppy-themed elements

## Detailed Screen Specifications

### Home Screen

#### Layout

- ✅ **Header**: App title "Poppy's Food Tracker"
- ✅ **Daily Target Section**: Display recommended daily amount
- ✅ **Progress Visualization**: Row of cup icons (filled/empty) showing progress
- ✅ **Input Controls**:
  - ✅ Numeric display showing current amount fed
  - ✅ "+" and "-" buttons to adjust amount (in 0.25 cup increments)
- ✅ **Today's Summary**: Text showing total cups fed today and remaining
- ✅ **Poppy Theme Elements**: Cup icons with fill levels, rounded corners

#### Functionality

- ✅ Display current day's feeding amount
- ✅ Allow increment/decrement of feeding amount
- ✅ Visual feedback when adding food
- ✅ Save changes to local storage
- ✅ Reset daily counter at midnight

#### User Flow

1. ✅ User opens app
2. ✅ Current day's feeding data is displayed
3. ✅ User adjusts amount using "+" and "-" buttons
4. ✅ App updates visual progress indicator
5. ✅ Data is saved automatically

### History Screen

#### Layout

- ✅ **Header**: "Feeding History" title
- ✅ **History List**: Scrollable list showing:
  - ✅ Date
  - ✅ Total amount fed
  - ✅ Visual indicator (small cups) showing amount relative to target
- ⏳ **Summary Statistics**: Average daily feeding amount for the week/month (future enhancement)

#### Functionality

- ✅ Load feeding history from device storage
- ✅ Display history in reverse chronological order
- ⏳ Allow filtering by date range (future enhancement)
- ⏳ Provide simple statistics (future enhancement)

## Data Structure

### Feeding Entry

```json
{
  "date": "2025-04-18", // YYYY-MM-DD format
  "amountFed": 2.5, // Number of cups
  "target": 3, // Target cups per day
  "timestamp": 1618764000000 // Unix timestamp
}
```

### Local Storage Keys

- ✅ `@PoppyTracker:currentDay` - Current day's feeding information
- ✅ `@PoppyTracker:feedingHistory` - Array of past feeding entries
- ✅ `@PoppyTracker:settings` - App settings including daily target amount

## UI/UX Design

### Color Scheme

- ✅ **Primary**: Warm puppy brown (#A67B5B)
- ✅ **Secondary**: Playful light blue (#7BCDEE)
- ✅ **Accent**: Energetic orange (#FF9E44)
- ✅ **Background**: Soft cream (#FFF8E8)
- ✅ **Text**: Dark brown (#4A3728)

### Typography

- ✅ **App Title**: System font with bold weight
- ✅ **Regular Text**: System font
- ✅ **Buttons**: System font with bold weight

### Visual Elements

- ✅ Cup icons showing fill levels
- ✅ Rounded corners on all containers
- ⏳ Dog paw prints as decorative elements (future enhancement)
- ⏳ Simple, cute illustration of Poppy (future enhancement)
- ⏳ Subtle animations for interactions (future enhancement)

## Implementation Guidelines

### Local Storage Implementation

✅ Implemented as shown in the design document, with additional error handling and loading states.

### Progress Visualization Component

✅ Implemented as `FeedingProgress` and `CupIcon` components with the exact functionality described.

## API Integration (Future)

The app will be prepared for backend integration with the following endpoints:

### Proposed API Endpoints

- `GET /api/feeding-records` - Retrieve feeding history
- `POST /api/feeding-records` - Create a new feeding record
- `PUT /api/feeding-records/:date` - Update a feeding record
- `GET /api/settings` - Retrieve user settings
- `PUT /api/settings` - Update user settings

### API Helper Functions

⏳ To be implemented in future updates.

## Testing Strategy

- Unit tests for core functionality
- Component tests for UI elements
- Integration tests for storage operations
- Manual testing on iOS devices

## Development Milestones

1. Set up Expo project with React Native
2. Implement basic navigation structure
3. Create Home Screen UI with progress visualization
4. Implement local storage functionality
5. Create History Screen with basic listing
6. Add Poppy-themed styling and UI improvements
7. Implement data visualization for history
8. Prepare API integration structure
9. Testing and refinement
10. Build for distribution

## Enhancement Opportunities

- Reminder notifications to feed Poppy
- Different food types tracking
- Photo gallery of Poppy
- Feeding schedule management
- Weight tracking integration
- Different themes or seasonal decorations

## Features

### Core Features Checklist

- [ ] **Project Setup**

  - [ ] Initialize Expo project
  - [ ] Configure navigation system
  - [ ] Set up project folder structure
  - [ ] Install necessary dependencies

- [ ] **UI Components**

  - [ ] Create custom Cup icon component with fill visualization
  - [ ] Design Poppy-themed header component
  - [ ] Build feeding amount adjustment controls
  - [ ] Implement progress visualization bar
  - [ ] Create history list item component

- [ ] **Screens**

  - [ ] **Home Screen**

    - [ ] Design main layout
    - [ ] Implement feeding amount controls
    - [ ] Create progress visualization
    - [ ] Add Poppy-themed decorative elements
    - [ ] Implement auto-saving functionality

  - [ ] **History Screen**
    - [ ] Create date-organized list view
    - [ ] Implement history filtering options
    - [ ] Design individual history entries
    - [ ] Add basic statistics section

- [ ] **Data Management**

  - [ ] Set up AsyncStorage utilities
  - [ ] Implement daily data reset functionality
  - [ ] Create feeding history storage system
  - [ ] Build data migration for first launch

- [ ] **State Management**

  - [ ] Create app context for global state
  - [ ] Implement feeding data reducers
  - [ ] Set up settings management

- [ ] **API Integration (Placeholder)**

  - [ ] Create API service structure
  - [ ] Implement mock API functions
  - [ ] Add network state handling
  - [ ] Prepare offline sync functionality

- [ ] **Testing & Refinement**

  - [ ] Write unit tests for core functionality
  - [ ] Test on iOS simulator
  - [ ] Optimize performance
  - [ ] Add error handling

- [ ] **Styling & Theme**
  - [ ] Implement color scheme
  - [ ] Create typography styles
  - [ ] Add animations and transitions
  - [ ] Ensure iOS-specific design compliance

### Enhancement Features (Future)

- [ ] Push notifications for feeding reminders
- [ ] Multiple pet profiles
- [ ] Food type tracking
- [ ] Feeding schedule management
- [ ] Photo gallery integration
- [ ] Data export functionality
- [ ] Weight tracking
