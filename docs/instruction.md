# Gardening Game Project Structure

## Overview
This is a web-based gardening game with multiple interconnected components. The project has been refactored to use OOP principles with proper class structure.

## Key Classes
- `Game`: Central game controller managing game state, UI messages, and scene transitions
- `Player`: Manages player stats, inventory, and HUD elements
- `Controls`: Handles player movement and location checking
- `QRScanner`: Manages QR code scanning functionality

## Dependencies
- **game.js depends on player.js** - Player class methods are called from Game class methods
- **scanner.js depends on game.js** - QRScanner class calls Game.showMarkerAt method
- **controls.js depends on game.js** - Controls interacts with Game for location-based features

## HTML Pages
- **index.html**: Main entry point
- **QR.html**: Map and QR scanning interface, loads all core game scripts
- **planting.html**: Garden simulation interface
- **location.html**: Location tracking and exploration

## Script Loading Order
The correct script loading order in QR.html is:
1. data.js (contains game data)
2. player.js (player functionality)
3. game.js (core game functionality)
4. Other specialized scripts

## OOP Implementation Notes
- Each component is now a proper ES6 class with static methods
- Global functions have been removed in favor of class methods
- Direct class method calls are used to maintain clear dependencies (e.g., Game.showMarkerAt, Player.updateStaminaOnMove)

## Usage
When extending the game, always:
1. Maintain the correct script loading order
2. Use proper class method calls instead of global functions
3. Update any new components to follow the OOP structure 

# Bug Fix Instructions

## Issue Fixed
Fixed the error: `player.js:83 Uncaught TypeError: Cannot set properties of null (setting 'textContent')` that occurred when using the "SCAN QR CODE" or "Skip to challenges" buttons.

## What Caused the Problem
The error occurred because:
1. The code was trying to update the stamina display in the Player HUD
2. When clicking "SCAN QR CODE" or "Skip to challenges" buttons, the Player HUD wasn't created yet
3. This caused `document.querySelector(".hud-stamina")` to return null

## Changes Made
1. Added a null check in `Player.updateStaminaOnMove()` to verify the stamina element exists
2. If the element doesn't exist, it now creates the Player HUD
3. Added a check in `Game.showMarkerAt()` to ensure player stats exist in localStorage

## Testing
Test the fix by:
1. Clicking "SCAN QR CODE" button
2. Clicking "Skip to challenges" button 
3. Verify no errors appear in the console

If issues persist, check the browser console for any new errors. 

# Button Event Listener Fix

## Changes Made

1. Moved all button event listeners to `main.js` to consolidate event handling in one place
2. Added missing event listeners for:
   - `sleepBtn` (Take a Break)
   - `startExploringBtn` (Start Exploring)
3. Removed redundant code:
   - Deleted duplicate event handlers in `controls.js`
   - Removed inline event handlers in `game.js`
   - Removed exposed global functions that are no longer needed

## Testing

1. Sleep button should now correctly:
   - Call `Player.rest()`
   - Move player to location index 6
   
2. Start Exploring button should now correctly:
   - Check for nearby locations
   - Display appropriate alert messages
   - Create seed button when at a valid location

All buttons should now respond to clicks as expected. 

# Fixed JavaScript Errors

## Issues Fixed

1. Fixed `Uncaught SyntaxError: Identifier 'AudioController' has already been declared`
   - Problem: Game.js was adding the audioControl.js script multiple times
   - Solution: Added a check to prevent re-adding the script if it's already loaded

2. Fixed `Uncaught ReferenceError: setupControls is not defined`
   - Problem: Global setupControls function was removed, but still being called in game.js
   - Solution: Updated game.js to directly call controlsInstance.setupControls() instead

## Testing

1. Test by using the "Skip to challenges" button
2. Navigate between different locations
3. Verify no errors appear in the browser console

The game should now work properly without JavaScript errors. 

# Seed Collection Feature Fix

## Problem
The seed collection mechanism wasn't working because the seed collision detection system wasn't being initialized.

## Fix Applied
Added `SeedCollection.initSeedCollectionSystem()` call at the end of the `seed.js` file to ensure the collision detection hook is registered when the game loads.

## How It Works
1. `initSeedCollectionSystem()` overrides the original `moveMarker` function with a wrapper that:
   - Calls the original movement code
   - Checks for seed collisions after each movement

2. When the player marker intersects with a seed:
   - The seed is collected and added to the player's notebook
   - A collection sound plays
   - The seed is removed from the screen
   - The system checks if any phrases have been completed

## Testing
Test the fix by:
1. Loading the game
2. Clicking the "Click for Seeds" button
3. Using arrow keys to move the player marker over seeds
4. Verifying seeds disappear and sounds play on collection 