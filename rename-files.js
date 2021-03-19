/**
 * $Source: /repo/public.cvs/app/gdrive-rename-files/github/rename-files.js,v $
 * @copyright $Date: 2021/03/19 02:58:54 $ UTC
 * @version $Revision: 1.31 $
 * @author TurtleEngr
 * @license https://www.gnu.org/licenses/gpl-3.0.txt
 * If testing:
 * @requires test-rename-files.gs
 * 
 * Prefix codes:
 *  pName       - a parameter passed into a function
 *  pArg={}     - pass args *in any order* and to set default values for any arg
 *  tName       - a variable that is local to a function
 *  obj.name    - a class variable that a user can usually "get" or "set"
 *  obj._name   - a class variable that is assumed to be private (do not depend on it)
 *  obj.name()  - a class method
 *  _name()     - a function or method that is assumed to be private (do not depend on it)
 *  obj.uiName()- this method is probably called by a menuName() function
 *  menuName()  - a menu item is usually bound to these functions, and they call obj.uiName() methods
 *  fName()     - usually a global function
 */

/* ToDo List
 * Refactor messy code - always
 * Implement the Advanced match/replace fields.
 * Create ui map vars for the RenameList sheet (these are currently hardcoded).
 * Add filters to limit folders/files listed (allow pattern, exclude pattern ?)
 * Figure out how to "Deploy" the script.
 */
'use strict';

// ==============================================
// Define menus

function onOpen(e) {
  try {
    let ui = SpreadsheetApp.getUi();
    let menu = ui.createMenu('Rename-Files')
      .addItem('Get List', 'menuGetList')
      .addItem('Rename List', 'menuRenameList')
      .addItem('Undo List', 'menuUndoList')
    if (typeof menuTestRename === 'function')
      menu = menuTestRename(ui, menu);
    if (typeof menuTestUtilObjs === 'function')
      menu = menuTestUtilObjs(ui, menu);
    if (typeof menuGsUnitTest === 'function')
      menu = menuGsUnitTest(ui, menu);
    menu.addToUi();
  } catch (e) {
    console.error('InternalError');
    console.error(e.stack);
    throw e;
  }
}

function menuGetList() {
  let tRenObj = new RenameFiles({ logName: 'RenameList' });
  tRenObj.uiGetList();
  return tRenObj;
}

function menuRenameList() {
  let tRenObj = new RenameFiles({ logName: 'RenameList' });
  tRenObj.uiRenameList();
  return tRenObj;
}

function menuUndoList() {
  let tRenObj = new RenameFiles({ logName: 'RenameList' });
  tRenObj.uiUndoList();
  return tRenObj;
}

// ==============================================
// Rename Class and Functions

/** ------------------------------------
 * @class
 * @classdesc Get files with rename, execute renames, undo renames
 * @param {obj} pArg - {configName: 'Interface', logName: 'RenameList', debug: true, test: false}
 */
class RenameFiles {
  constructor(pArg = {}) {
    this.debug = fDefault(pArg.debug, false);
    this.test = fDefault(pArg.test, false);  // if true, "test-blocking" UI alerts will not be shown
    this.email = 'turtle.engr+rename-files@gmail.com';
    this.error = null;  // Error obj
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.ui = SpreadsheetApp.getUi();
    this.sheetLog = fDefault(pArg.logName, 'RenameList');
    this.stl = fSelectSheet(this.ss, this.sheetLog);
    this.sheetUI = fDefault(pArg.configName, 'Interface');
    this.stu = this.ss.getSheetByName(this.sheetUI);
    if (this.stu == null)
      throw new Exception('The "' + this.sheetUI + '" sheet is missing! It must be restored.', 'fatal-error')

    // processElement() variables/methods
    this.list = [];
    this.parentPath = [];
    this.count = 0;
    this.statusCount = 25;
    this.walkFolders = new WalkFolderFiles({ topFolder: null, collectObj: this, debug: this.debug });

    // These are managed with get/set because they also affect the WalkFolderFiles object
    this._topFolder = null; // See setTopFolderById
    this._getFiles = true;
    this._getFolders = true;
    this._levelLimit = 1;

    // Interface spreadsheet mapping vars
    this.uiInfo = {
      version: { cell: 'A2', index: 0, type: 's', value: '$Revision: 1.31 $' },
      topFolderName: { cell: 'D3', index: 0, type: 's', value: '' },
    };
    this.uiRange = { cell: 'B3:B13' };
    this.uiMap = {
      topFolderId: { cell: 'B3', index: 0, type: 's', value: '' },
      getFolders: { cell: 'B4', index: 1, type: 'b', value: 'yes' },
      getFiles: { cell: 'B5', index: 2, type: 'b', value: 'yes' },
      levelLimit: { cell: 'B6', index: 3, type: 'n', value: 1, min: 1, max: 1000 },
      rename: { cell: 'B7', index: 4, type: 'b', value: 'yes' },
      onlyShowDiff: { cell: 'B8', index: 5, type: 'b', value: 'no' },
      saveLog: { cell: 'B9', index: 6, type: 'b', value: 'no' },
      empty1: { cell: 'B10', index: 7, type: 's', value: '' },
      empty2: { cell: 'B11', index: 8, type: 's', value: '' },
      regExMatch: { cell: 'B12,  index:9', type: 'm', value: '' },
      regExReplace: { cell: 'B13,  index:10', type: 'r', value: '' },
    };
    this.topFolderId = this.uiMap.topFolderId.value;  // Id or URL, passed to setTopFolderById
    this.getFolders = this.uiMap.getFolders.value;    // only list folders
    this.getFiles = this.uiMap.getFiles.value;        // only list files
    this.levelLimit = this.uiMap.levelLimit.value;    // Limit recursion levels
    this.rename = this.uiMap.rename.value;            // if yes, call replaceSpecial()
    this.onlyShowDiff = this.uiMap.onlyShowDiff.value;// if yes, don't show names that are the same
    this.saveLog = this.uiMap.saveLog.value;          // duplicate sheetLog, before changing the sheet
    this.regExMatch = this.uiMap.regExMatch.value;
    this.regExReplace = this.uiMap.regExReplace.value;

    // RenameList sheet mapping vars (TBD)
  } // constructor

  /** ---------------------
   * @private
   * @method Handle unexpected errors. Outputs msg to console and to toast.
   *  If obj is in test mode, throw the error, else popup an alert.
   * @param {string} pE - the unexpected error object
   */
  _reportError(pE) {
    this.error = pE;
    let tMsg = this.uiInfo.version + '\nUnexpected ' + pE.toString() + '\nstack dump:\n' + pE.stack;
    console.error(tMsg);
    this.ss.toast(pE.toString(), 'Unexpected ' + pE.name, -1);
    if (this.test)
      throw pE;

    tMsg = 'Please copy the following text and email it to ' + this.email + '\n\n' + tMsg;
    this.ui.alert('Unexpected ' + pE.name, tMsg, this.ui.ButtonSet.OK);
  } // reportError

  /** ---------------------
   * @private
   * @method Get the cell values from the Interface sheet. Validate the values.
   */
  _getConfig() {
    try {
      this.stu.activate();
      let tValues = this.stu.getRange(this.uiRange.cell).setBackground('white').getValues();
      if (this.debug) console.info(tValues);

      this.stu.getRange(this.uiInfo.version.cell).setValue(this.uiInfo.version.value);
      this._setTopFolderById(tValues[this.uiMap.topFolderId.index][0]);
      this.getFolders = this._verifyTF('getFolders', tValues);
      this.getFiles = this._verifyTF('getFiles', tValues);
      this.levelLimit = this._verifyNum('levelLimit', tValues);
      this.walkFolders.maxLevel = this.levelLimit;
      this.rename = this._verifyTF('rename', tValues);
      this.onlyShowDiff = this._verifyTF('onlyShowDiff', tValues);
      this.saveLog = this._verifyTF('saveLog', tValues);
    } catch (e) {
      this._handleConfigErrors(e);
    }
  } // getConfig

  /**
   * @private
   * @method Handle any errors in getConfig(). 'ui-error' is expected. All others are thrown.
   */
  _handleConfigErrors(pE) {
    this.error = pE;
    if (pE instanceof Exception) {
      if (pE.code === 'ui-error') {
        this.stu.getRange(pE.num).setBackground('#ffbbbb');
        this.ss.toast('Fix the error highlighted in red.', pE.message + ' at ' + pE.num, -1);
        throw pE;
      }
    }
    this._reportError(pE);
    throw pE;
  }

  /**
   * @private
   * @method If the top folder is found set its handle, and put its name in the Interface sheet.
   */
  _setTopFolderById(pId) {
    try {
      pId = fUrl2Id(pId);
      this.topFolder = DriveApp.getFolderById(pId);
      this.uiMap.topFolderId.value = this.topFolder.getUrl();
      this.uiInfo.topFolderName.value = this.topFolder.getName();
      // Output
      this.stu.getRange(this.uiInfo.topFolderName.cell).setValue(this.uiInfo.topFolderName.value);
    } catch (e) {
      throw new Exception('Top Folder Id not found.', 'ui-error', this.uiMap.topFolderId.cell);
    }
  } // setTopFolderById

  /**
   * @private
   * @method Validate true/false values.
   * @param {string} pKey - this is the uiMap key for the value to be checked. (index, cell)
   * @param {array} pValues - this is the list of cell values.
   */
  _verifyTF(pKey, pValues) {
    let tValue = pValues[this.uiMap[pKey].index][0];
    if (typeof tValue === 'string')
      tValue = tValue.toLowerCase();
    let tResult = undefined;
    if (/^(y|yes|t|true|1)$/.test(tValue))
      tResult = true;
    if (/^(n|no|f|false|0)$/.test(tValue))
      tResult = false;
    if (tResult == undefined)
      throw new Exception('Invalid value', 'ui-error', this.uiMap[pKey].cell);
    return tResult;
  }

  /**
   * @private
   * @method Validate number values.
   * @param {string} pKey - this is the uiMap key for the value to be checked. (index, cell, min, max)
   * @param {array} pValues - this is the list of cell values.
   */
  _verifyNum(pKey, pValues) {
    let tValue = pValues[this.uiMap[pKey].index][0];
    if (tValue == NaN)
      throw new Exception('Invalid value', 'ui-error', this.uiMap[pKey].cell);
    if (tValue < this.uiMap[pKey].min || tValue >= this.uiMap[pKey].max)
      throw new Exception('Invalid value', 'ui-error', this.uiMap[pKey].cell);
    return tValue;
  }

  get topFolder() {
    return this._topFolder;
  }
  set topFolder(pFolder) {
    this._topFolder = pFolder;
  }

  get getFolders() {
    return this._getFolders;
  }
  set getFolders(pState) {
    this._getFolders = pState;
    if (!this._getFiles && !pState)
      throw new Exception('Nothing will be done, because both are "no".', 'ui-error',
        this.uiMap.getFolders.cell + ':' + this.uiMap.getFiles.cell);    
  }

  get getFiles() {
    return this._getFiles;
  }
  set getFiles(pState) {
    this._getFiles = pState;
    this.walkFolders.incFiles = pState;
    if (!this._getFolders && !pState)
      throw new Exception('Nothing will be done, because both are "no".', 'ui-error',
        this.uiMap.getFolders.cell + ':' + this.uiMap.getFiles.cell);
  }

  get levelLimit() {
    return this._levelLimit;
  }
  set levelLimit(pLimit) {
    this._levelLimit = pLimit;
    this.walkFolders.maxLevel = pLimit;
  }

  /** -----------------
   * This the functional part of GetList
   */
  getFolderList() {
    this.list = [];
    this.parentPath = [];
    this.count = 0;
    this.walkFolders.start(this.topFolder);
  } // getFolderList

  processElement(pArg = {}) {
    let pElement = fDefault(pArg.element, null);
    let pLevel = fDefault(pArg.level, 0);
    let pType = fDefault(pArg.type, '');

    if (pElement == null)
      throw new SyntaxError('Missing file handle.');
    if (pLevel <= 0)
      throw new SyntaxError('Invalid level: ' + pArg.level);
    if (pType != '' && pType != '/')
      throw new SyntaxError('For type, expected / or nothing.');

    ++this.count;
    if (this.count % this.statusCount == 0)
      this.ss.toast('Processed: ' + this.count, 'Get List Running', -1);

    let tName = pElement.getName();
    let tNameLink = '=HYPERLINK("' + pElement.getUrl() + '", "Id")';
    let tNewName = tName;

    let tParentPath = this.parentPath.join('/') + '/';
    let tParentUrl = pArg.element.getParents().next().getUrl();
    let tParentLink = '=HYPERLINK("' + tParentUrl + '", "' + tParentPath + '")';

    if (this.rename)
      tNewName = fReplaceSpecial(tName);
    if (this.rename && this.onlyShowDiff && tNewName == tName)
      return;

    let tRow = [
      pLevel,
      tParentLink,
      tName + pType,
      tNewName + pType,
      tNameLink,
    ];
    this.list.push(tRow);
  } // processElement

  /** ---------------------
   * @method Functional entry point for renaming the current to new names, in the log sheet
   */
  renameList() {
    this._processList(true);
  } // renameList

  /** ---------------------
   * @method Functional entry point for renaming the new back to current names, in the log sheet
   * Same as renameList, but swap column C and D
   */
  undoList() {
    this._processList(false);
  } // undoList

  /**
   * @private
   * @method renameList aand undoList are almost identical, so this function does all the work.
   */
  _processList(pRename = true) {
    let tId = '';
    let tIsFolder = /\/$/;
    let tNewName = '';
    let tOldName = '';
    let tYesList = [];
    let tColMap = {};

    this.stl.activate();
    let tNumRows = this.stl.getLastRow() - 1; // deduct heading
    if (tNumRows <= 0)
      throw new Exception('The "' + this.sheetLog + '" is empty.', 'empty-list');

    let tNameList = this.stl.getRange(2, 3, tNumRows, 2).getValues();
    let tIdList = this.stl.getRange(2, 5, tNumRows, 1).getFormulas();
    if (pRename)
      tColMap = { CurrentName: 0, NewName: 1, Hyper: 0 };   // rename
    else
      tColMap = { CurrentName: 1, NewName: 0, Hyper: 0 };   // undo

    for (let i in tNameList) {
      tOldName = tNameList[i][tColMap.CurrentName];
      tNewName = tNameList[i][tColMap.NewName
      ];
      tYesList.push([pRename ? 'yes' : 'no']);
      if (tNewName === tOldName)
        continue;

      tId = fHyper2Id(tIdList[i][tColMap.Hyper]);
      if (tIsFolder.test(tNewName))
        DriveApp.getFolderById(tId).setName(tNewName.replace(tIsFolder, ''));
      else
        DriveApp.getFileById(tId).setName(tNewName);
    }

    this.stl.getRange(2, 6, tNumRows, 1).setValues(tYesList);
  } // _processList

  /** ---------------------
   * @method UI entry point for GetList
   */
  uiGetList() {
    try {
      this.ss.toast('Getting the names, and putting them in sheet: "' +
        this.sheetLog + '"', 'Get List Running', -1);
      this._initializeLogSheet();

      this.getFolderList();
      this._addListToSheet();
      this._sortRows();
      this._setColumnSize();

      this.ss.toast('Review the names. Repeat if desired. ' +
        '"NewName" names can be changed. Rows can be deleted. ' +
        'Make no other changes.', 'Get List Done', -1);
    } catch (e) {
      this._handleGetListError(e);
    }
  } // uiGetList

  /**
   * @private
   * @method Get the UI values, duplicate the log sheet, if requested,
   *  clear the sheet, and add the heading.
   */
  _initializeLogSheet() {
    this._getConfig();
    this.stl.activate();
    if (this.saveLog)
      this.ss.duplicateActiveSheet();
    this.stl.activate().clear();
    // Add Header
    this.stl.getRange('A1:F1').setFontWeight('bold').setValues([[
      ['Level'],
      ['ParentFolder'],
      ['CurrentName'],
      ['NewName'],
      ['Link'],
      ['Renamed']
    ]]);
    this.stl.setFrozenRows(1);
  }

  /**
   * @private
   * @method Add the list of collected names to the log sheet.
   */
  _addListToSheet() {
    if (this.list.length == 0)
      throw new Exception('Nothing found.', 'empty-list');
    // Add list to the sheet
    this.stl.getRange(2, 1, this.list.length, 5).setValues(this.list).setWrap(true);
  }

  /**
   * @private
   * @method Sort the rows in the log sheet by: Level, Parent, NewName
   */
  _sortRows() {
    let tSortOrder = [
      { column: 2, ascending: true },
      { column: 4, ascending: true }
    ];
    this.stl.getRange(2, 1, this.list.length, 6).sort(tSortOrder);
  }

  /**
   * @private
   * @method Set the column sizes so things fit on screen.
   */
  _setColumnSize() {
    let tMaxWidth = 1050;
    let tNameColWidth = 300;
    // A 42; B 300; C 300; D 300; E 32; F 72 = 1046
    let tCol = 0;
    let tTotalWidth = 0;
    let tNumRows = this.stl.getLastRow() - 1;
    this.stl.getRange(2, 2, tNumRows, 4).setWrap(false); // needs to be false for autoResize to work
    this.stl.autoResizeColumns(1, 6);
    for (tCol = 1; tCol <= 6; ++tCol)
      tTotalWidth += this.stl.getColumnWidth(tCol);

    if (tTotalWidth > tMaxWidth)
      for (tCol = 2; tCol <= 4; ++tCol)
        this.stl.setColumnWidth(tCol, tNameColWidth);
    this.stl.getRange(2, 2, tNumRows, 4).setWrap(true);
  }

  /**
   * @private
   * @method Handle expected errors: empty-list or ui-error. Throw unexpected errors.
   */
  _handleGetListError(pE) {
    this.error = pE;
    if (pE instanceof Exception) {
      if (pE.code === 'empty-list') {
        this.ss.toast('No files were found with your settings.', 'Get List Done', -1);
        return pE.code;
      }
      if (pE.code === 'ui-error')
        return pE.code;
    }
    this._reportError(pE);
    return 'unexpected';
  }

  /** ---------------------
   * method UI entry point for RenameList
   */
  uiRenameList() {
    return this._uiProcessList(true);
  } // uiRenameList

  /** ---------------------
   * @method UI entry pont for UndoList
   */
  uiUndoList() {
    return this._uiProcessList(false);
  } // uiUndoList

  /**
   * @private
   * @method Common function for uiRenameList and uiUndoList.
   */
  _uiProcessList(pRename = true) {
    try {
      this.ss.toast(pRename ? 'Renaming' : 'Undoing' + ' the names found in sheet: "' + this.sheetLog + '"',
        pRename ? 'Rename' : 'Undo' + ' List Running', -1);
      this._getConfig();
      this.stl.activate();
      if (this.saveLog)
        this.ss.duplicateActiveSheet();
      if (pRename) {
        this.renameList();
        this.ss.toast('If this looks wrong, you can delete the rows that are OK, ' +
          'then run "Undo List" to revert the changes.', 'Rename List Done', -1);
      } else {
        this.undoList();
        this.ss.toast('You can undo this undo by running "Rename List".', 'Undo List Done', -1);
      }
    } catch (e) {
      this._handleUiProcessListError(e, pRename);
    }
  } // _uiProcessList

  /**
   * @private
   * @method Handle expected errors: empty-list or ui-error. Throw unexpected errors.
   */
  _handleUiProcessListError(pE, pRename) {
    this.error = pE;
    if (pE instanceof Exception) {
      if (pE.code === 'empty-list') {
        this.ss.toast(pE.message, pRename ? 'Rename' : 'Undo' + ' List Done', -1);
        return pE.code;
      }
      if (pE.code === 'ui-error')
        return pE.code;
    }
    this._reportError(pE);
    return 'unexpected';
  }
} // RenameFiles
