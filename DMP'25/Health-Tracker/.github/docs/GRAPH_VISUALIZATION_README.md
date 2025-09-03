# Health Tracker - Graph Visualization Feature

## Overview

The Health Tracker now includes dynamic graph visualization functionality for nutrition data. This feature allows users to visualize their diet and nutrition information in both detailed and summary chart formats.

## New Features Added

### 1. Updated Template Structure

- Updated the Diet Plan template to support 6 sheets (intro, items, week1-week4)
- Added `showGraph` property to control which sheets can show graphs
- Added `graphMappings` property to define visualization configuration for each sheet

### 2. Graph Visualization Component

- **Location**: `src/components/GraphVisualization.tsx`
- **Features**:
  - Bar charts and Doughnut/Pie charts
  - Dynamic data extraction from SocialCalc sheets
  - Support for detailed item visualization (sheet2)
  - Support for summary nutrition totals (sheet3-6)
  - Error handling and loading states

### 3. Visual Interface Updates

- Added visualization button (chart icon) in floating action buttons
- Button only appears for sheets that support graphs
- Positioned above the edit button for easy access

### 4. Template Configuration

#### Sheet2 (Items Sheet)

- **Type**: Detailed visualization
- **Shows**: Individual food items with their nutrition values
- **Columns**: Name (C), Cal (D), Carbs (E), Sugar (F), Fiber (G)
- **Rows**: 7-36

#### Sheet3-6 (Weekly Sheets)

- **Type**: Summary visualization
- **Shows**: Total nutrition values for the week
- **Values**: Cal (E4), Carbs (E5), Sugar (E6), Fiber (E7)

## Technical Implementation

### Dependencies Added

- `chart.js` - Chart rendering library
- `react-chartjs-2` - React wrapper for Chart.js

### Key Components Modified

1. **templates.ts** - Updated interface and data structure
2. **Home.tsx** - Added visualization button and integration
3. **GraphVisualization.tsx** - New component for chart rendering

### Data Flow

1. User clicks visualization button
2. Component checks if current sheet supports graphs
3. Extracts data from SocialCalc sheet cells
4. Renders appropriate chart type based on configuration
5. Allows switching between bar and pie chart views

## Usage

1. Open a Diet Plan template
2. Navigate to Items sheet (sheet2) or any Weekly sheet (sheet3-6)
3. Click the chart icon button (appears only on graph-enabled sheets)
4. View nutrition data in interactive charts
5. Switch between bar chart and pie chart views using the segment buttons

## Benefits

- **Visual Analysis**: Easily understand nutrition patterns and totals
- **Quick Insights**: Spot nutritional imbalances at a glance
- **Interactive**: Switch between different chart types for various perspectives
- **Context-Aware**: Only shows when relevant data is available

## Future Enhancements

- Additional chart types (line charts for trends)
- Export chart functionality
- Comparison views between different weeks
- Custom color themes for charts
