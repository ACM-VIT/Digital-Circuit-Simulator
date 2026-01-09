# Changelog

All notable changes to the Digital Circuit Simulator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2026-01-09

### 🎉 Added

#### Undo/Redo Functionality
- **Undo/Redo Support** - Full undo/redo functionality with keyboard shortcuts
  - `Ctrl+Z` (or `Cmd+Z` on Mac): Undo last action
  - `Ctrl+Y` (or `Cmd+Y` on Mac): Redo action
  - `Ctrl+Shift+Z`: Alternative redo shortcut
  - Maintains history of up to 50 steps
  - Smart history tracking that captures all node and edge changes including:
    - Adding/removing nodes and wires
    - Moving nodes and repositioning components
    - Connecting/disconnecting wires
    - All circuit modifications
- **History Panel** - Added popup to see previous 50 steps and go back to desired precise state back.
  - Descriptive action names instead of generic step numbers:
    - "Added AND", "Deleted OR", "Moved Input A"
    - "Created branch node", "Connected wires", "Disconnected wires"
    - "Imported Half Adder", "Renamed to Output Y"

#### Circuit Management Features
- **Dynamic Circuit Routes** - Clean URL structure for sharing and accessing circuits
  - `/circuit` - Create new empty circuit
  - `/circuit/{id}` - Direct link to specific saved circuit
  - Automatic verification and loading of circuit by ID
  - Better sharing with clean URLs instead of query parameters
- **Custom labels** - Added option for users to custom rename the inputs,outputs and logic gates
- **Right Click Option** - Added right click circuit option to 
    - "Rename" 
    - "Copy"
    - "Duplicate" - with 50px offset positioning
    - "Delete" - Moved Delete to here
- **Import Circuits** - Users can import their own ciruits back to new circuit in one block.
- **Dynamic Gate Sizing** - Gate components automatically resize vertically based on input/output count
- **Variable Input Count for Logic Gates** - Logic gates (AND, OR, NAND, NOR, XOR, XNOR) can now have 2-8 inputs via right-click context menu
- **Marquee selection** - Holding control for marquee selection for copy paste

#### Wire Management & Branch Points
- **Branch Point Creation** - Double-click on any wire to create a branch point for signal splitting or create a branch node
- **Wire Selection** - Wires can now be selected by clicking directly on them and deleted with delete key

#### Dashboard
- **Right click on categories or circuits**
    - "Rename"
    - "Delete"
    - "Duplicate" (only for circuits not categories)
#### View Controls
- **Fullscreen Mode Toggle** - Added fullscreen mode button to maximize workspace area


### 🐛 Fixed

#### UI/UX Fixes
- **Toolbar Dropdown Toggle** - Logic Gates and other category dropdowns can now be closed by clicking the category name again

#### Technical Fixes
- **TypeScript Interface Extension** - Added `isImported` and `importedCircuitId` properties to `GateType` interface to prevent compilation errors
- **Source Handle DOM Warning** - Fixed "non-boolean attribute `truth`" warning in Source component by destructuring custom props before spreading to Handle
  - Matches pattern used in Target component
  - Prevents React from passing custom props to DOM
- **Null Safety in Circuit Simulation** - Added safety checks for `node.data.outputs` and `node.data.inputs` to prevent runtime errors when processing branch nodes
- **React Key Warnings in Modals** - Fixed duplicate key errors across all modal components
  - SaveCircuitModal: Added proper key and conditional wrapper
  - CircuitLibrary: Moved modals outside AnimatePresence, wrapped in fragment
  - ImportCircuitModal: Added key and conditional rendering
  - RenameModal: Added key and conditional rendering
  - InputCountModal: Added key and conditional rendering
  - ConfirmationModal: Added key and conditional rendering

### 🔄 Changed

#### Interaction Model
- **Panning & Selection Behavior** - Refined canvas interaction model
  - Normal left-drag: Pan background
  - Control + drag on empty space: Box selection (marquee)
  - Control + drag on branch node: Reposition branch point
  - Middle/right mouse: Alternative panning methods

---

## 👨‍💻 Author

**Neeraj** ([@NeerajCodz](https://github.com/NeerajCodz))

---

## 📝 Notes

This changelog documents all changes made during the January 9, 2026 development session. All features have been tested.