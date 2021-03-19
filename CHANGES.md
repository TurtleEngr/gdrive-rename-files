Changes in gdrive-rename-files
==============================
$Date: 2021/03/19 20:26:43 $ UTC

---

Changes in gdrive-rename-files-v-1.32
---------------------------------------
### Enhancements
- Added this CHANGES.md file
- Updated the README.md file. Included: Quick Start, Implementation
Notes, Update Notes, and Coding Style

### Internal Changes
- Make sure maxLevel is an int and >= 1
- Added abs and floor to limitLevel
- Changed "Replace" to "Rename" in test function names.

### Tests
- Fixed tests in test-util-objs
- Added failure tests to test-util-objs for WalkFolderFiles
- In test-utils-objs, fixed the top names of the expected test foldeers.

---

Changes in gdrive-rename-files-v-1.31
-------------------------------------
### Bugs Fixed
- Fixed issue #5. Setting List Folders to "no" now works.
- Fixed auto-resize. Remove "wrap" before resizing.

### Internal Changes
- Added fHyper2Title to util-objs
- Added "recreate" param to CreateFolderFiles class. This can speed up
testing. Only set recreate to true if the strucure was changed by a
test.

### Tests

- Refactored the top folder name pattern for the CreateFolderFiles
class. It now includes the "size" in the name.

---

Changes in gdrive-rename-files-v-1.30
-------------------------------------
### Enhancements
- Added a status popup for every 25 files or folders processed by "Get List"

### Internal Changes
- Refactored the menu creation
- Factored out more general functions and classes. Put them in util-objs.
- Refactored rename-files to use the functions and classes in util-objs
- Generalized the "walk file folders" code to a class, with callbacks
to handle filders or files.
- Cleaned up handling of default params
- Removed debugMsg() method. Replaced with more direct if stmts.
- Added getter/setter methods for properties that are "shared" with
other objects.

### Tests
- Added test-utils-objs
- Fixed any tests in test-rename-files

Changes in gdrive-rename-files-v-1.26
-------------------------------------
- This is the first stable version.

