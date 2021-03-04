/**
 * $Source: /repo/public.cvs/app/gdrive-rename-files/github/util-objs.js,v $
 * @copyright $Date: 2021/03/04 09:15:07 $ UTC
 * @version $Revision: 1.1 $
 * @author TurtleEngr
 * @license https://www.gnu.org/licenses/gpl-3.0.txt
 * If testing:
 * @requires test-util-objs.gs
 * @requires gsunit-test.gs
 * 
 * Prefix codes:
 *  pName       - a parameter passed into a function
 *  pArg={}     - pass args *in any order* and to set default values for any arg
 *  tName       - a variable that is local to a function
 *  obj.name    - a class variable that a user can usually get (careful with set, it could damage the object)
 *  obj._name   - a class variable that is assumed to be private (do not depend on it)
 *  obj.name()  - a class method
 *  _name()     - a function in a method that is assumed to be private (do not depend on it)
 *  obj.uiName() - this method is probably called by a menuName() function
 *  menuName()  - a menu item is usually bound to these functions, and they call obj.uiName() methods
 *  name()      - usually a global function
 */

/* ToDo List
 */
'use strict';

// ==============================================
// Define menus

function onOpen(e) {
  try {
    let ui = SpreadsheetApp.getUi();
    let menu = ui.createMenu('Tests')
      .addItem('RunAll Tests', 'runAllTests')
    if (typeof menuTestUtilObjs === 'function')
      menu = menuTestUtilObjs(ui, menu);
    menu.addToUi();
  } catch (e) {
    console.error('InternalError');
    console.error(e.stack);
    throw e;
  }
}

// ==============================================
// Functions

/**
 * @function
 * @return Return just the Id part of a gdrive URL. See also: _hyper2Id()
 */
function fUrl2Id(pUrl) {
  if (typeof pUrl != 'string')
    throw new SyntaxError('Expected a string.');

  // Remove URL part of id
  // https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0
  let tRmSuffix = /\/(edit|view).*$/;   // Remove any char after last /edit or /view if they exist
  pUrl = pUrl.replace(tRmSuffix, '');
  let tRmPath = /.*\//g;                // Remove all before id part
  pUrl = pUrl.replace(tRmPath, '');

  if (pUrl.length == 0)
    throw new Error('Invalid Id. Empty');
  if (pUrl.length != 33)
    throw new Error('Invalid Id. Id must be 33 char long');
  if (pUrl[0] != '1')
    throw new Error('Invalid Id. Id must begin with 1')
  return pUrl;
}

/**
 * @private
 * @method Return Id after removing hyperlink and URL part.
 */
function fHyper2Id(pHyper) {
  if (typeof pHyper != 'string')
    throw new SyntaxError('Expected a string.');
  // =HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")
  let tRmHyper = /.*HYPERLINK\(\"/;
  pHyper = pHyper.replace(tRmHyper, '');
  let tCleanEnd = /\",.*\)$/;
  return fUrl2Id(pHyper.replace(tCleanEnd, ''));
}


  /**
   * @param {string} pStr
   * @return {string} Replace all special char with '_'
   * Allowed: a-zA-Z0-9._-
   * Repeated [._-] chars are removed, until only one of these remain.
   * [._-] cannot be at beginning or end of string, remove
   * [_-] cannot be before or after '.'
   */
  function replaceSpecial(pStr) {
  let regEx = /./;
  //let tResultNew = regReplace(pStr, regEx = /[^a-zA-Z0-9_.-]+/g, '_');
  let tResultNew = pStr.replace(regEx = /[^a-zA-Z0-9_.-]+/g, '_');
  let tResult = '';
  let tLimit = 5; // Just to be safe

  // Loop until there are no differences
  while (tResult != tResultNew) {
    if (--tLimit <= 0) {
      throw new Error('Possible infinite loop.');
    }
    tResult = tResultNew;

    // Don't begin or end with these chars
    tResultNew = tResultNew.replace(regEx = /^[._-]+/, '');
    tResultNew = tResultNew.replace(regEx = /[._-]+$/, '');

    // No special char before or after '.'
    tResultNew = tResultNew.replace(regEx = /[_-]\./g, '.');
    tResultNew = tResultNew.replace(regEx = /\.[_-]/g, '.');

    // Odd patterns, simplify
    tResultNew = tResultNew.replace(regEx = /_-_/g, '-');
    tResultNew = tResultNew.replace(regEx = /-_-/g, '_');

    // More odd patterns
    tResultNew = tResultNew.replace(regEx = /_-/g, '_');
    tResultNew = tResultNew.replace(regEx = /-_/g, '-');

    // Remove dups
    tResultNew = tResultNew.replace(regEx = /_+/g, '_');
    tResultNew = tResultNew.replace(regEx = /-+/g, '-');
    tResultNew = tResultNew.replace(regEx = /[.]+/g, '.');
  }
  return tResultNew;
} // replaceSpecial

/**
 * @private
 * @param {string} pName - sheet name
 * @example let st = tRename.createSheet('foo');
 */
function _selectSheet(pName) {
  try {
    let st = this.ss.getSheetByName(pName);
    if (st == null)
      st = this.ss.insertSheet(pName);
    if (st == null)
      throw new Exception('Cannot create or select sheet: "' + pName + '"',
        'ss-error', 'selectSheet');
    st.activate();
    return st;
  } catch (e) {
    throw e;
  }
} // _selectSheet

// ==============================================
// Classes

/** ---------------------
 * @class
 * @classdesc Used to throw an Exception (non-error)
 * @param {string} pMessage
 * @param {string} pCode
 * @example throw new Exception('Invalid value in cell.', 'ui-error', 'B3');
 * @example catch(e) { this.ui.alert(e.toString()); } - outputs: Invalid value in cell (ui-error)[B3]
 */
class Exception extends Error {
  constructor(pMessage, pCode = '', pNum = '') {
    super(pMessage);
    this.name = "Exception";
    this.code = pCode;
    this.num = pNum;  // Often this will be a cell or cell range string
  }

  toString() {
    let tCode = this.code == '' ? '' : '(' + this.code + ')';
    let tNum = this.num == '' ? '' : '[' + this.num + ']';
    return this.name + ': ' + this.message + ' ' + tCode + tNum;
  }
}

/** ----------------------
 * @class
 * @classdesc Create test directory structure.
 * @param {obj} pArg = {name: 'test-tmp', size: 'large', debug: false}
 * @description Test with the simple structure. With debug==true, the output can be quickly verified.
 * @example tTestDirs = TestSetup({size: 'simple', debug: true});
 */
class TestSetup {
  constructor(pArg = {}) {

    this.name = pArg.name == undefined ? 'test-tmp' : pArg.name;  // Top folder name SS directory
    this.size = pArg.size == undefined ? 'large' : pArg.size;    // Number of nested folder/files
    this.debug = pArg.debug == undefined ? false : pArg.debug;    // Useful to debugging the structure

    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.ui = SpreadsheetApp.getUi();
    let tFileInDrive = DriveApp.getFolderById(this.ss.getId()); // Note: this does not work right afer this.ss is set.
    this.parentFolder = tFileInDrive.getParents().next();

    this.exists = this.parentFolder.getFoldersByName(this.name).hasNext();
    this.testFolder = this.exists ? this.parentFolder.getFoldersByName(this.name).next() : null;
    this.testURL = this.exists ? this.testFolder.getUrl() : '';

    this.structure = {
      simple:
        [
          [
            { type: 'folder', name: 'folder1', parent: 'test-tmp' },
            { type: 'file', name: 'file1', parent: 'folder1' },
            [
              { type: 'folder', name: 'folder2', parent: 'folder1' },
              { type: 'file', name: 'file2', parent: 'folder2' },
            ],
            { type: 'file', name: 'file3', parent: 'folder1' },
          ],
          [
            { type: 'folder', name: 'folder3', parent: 'test-tmp' },
            [
              { type: 'folder', name: 'folder4', parent: 'folder3' },
              { type: 'folder', name: 'folder5', parent: 'folder4' },
            ],
          ],
          { type: 'file', name: 'file4', parent: 'test-tmp' },
        ],
      small:
        [
          { type: 'file', name: 'L1^bar', parent: this.name },
          { type: 'file', name: 'L1:foo', parent: this.name },
          { type: 'file', name: 'L1_this_is_OK', parent: this.name },
          { type: 'file', name: 'L1_this_is_also_ok', parent: this.name },
          [
            { type: 'folder', name: 'L1 One', parent: this.name },
          ],
          [
            { type: 'folder', name: 'L1_this_folder-is-OK', parent: this.name },
            { type: 'file', name: 'L2 uyi dg', parent: 'L1_this_folder-is-OK' },
            [
              { type: 'folder', name: 'L3h(lf)%jsi.foox ', parent: 'L1_this_folder-is-OK' },
              { type: 'file', name: 'L4 sjkl46j*^JH^H\(', parent: 'L3h(lf)%jsi.foox ' },
            ],
          ],
          [
            { type: 'folder', name: 'L1 three', parent: this.name },
          ],
          [
            { type: 'folder', name: 'L1 Two', parent: this.name },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 Two' },
            { type: 'file', name: 'L2 file with lots of spaces', parent: 'L1 Two' },

          ],
        ],
      medium:
        [
          { type: 'file', name: 'L1^bar', parent: this.name },
          { type: 'file', name: 'L1:foo', parent: this.name },
          [
            { type: 'folder', name: 'L1 One', parent: this.name },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 One' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</jx ', parent: 'L1 One' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 One' },
            { type: 'file', name: 'L2-OK-File', parent: 'L1 One' },
            { type: 'file', name: 'L2 @#,$T%UG&.we/', parent: 'L1 One' },

          ],
          [
            { type: 'folder', name: 'L1 three', parent: this.name },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 three' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</j', parent: 'L1 three' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 three' },
            { type: 'file', name: 'L2  x @#,$T%UG&.we', parent: 'L1 three' },

          ],
          [
            { type: 'folder', name: 'L1 Two', parent: this.name },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 Two' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</j', parent: 'L1 Two' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 Two' },
            { type: 'file', name: 'L2 @#,$T%UG&.we', parent: 'L1 Two' },
          ],
        ],
      large:
        [
          { type: 'file', name: 'L1^bar', parent: this.name },
          { type: 'file', name: 'L1:foo', parent: this.name },
          [
            { type: 'folder', name: 'L1 One', parent: this.name },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 One' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</jx ', parent: 'L1 One' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 One' },
            { type: 'file', name: 'L2-OK-File', parent: 'L1 One' },
            { type: 'file', name: 'L2 @#,$T%UG&.we/', parent: 'L1 One' },
            [
              { type: 'folder', name: 'L2  (name)', parent: 'L1 One' },
              { type: 'file', name: 'L3 sfasda\%\^\&FufgnSDF\$\#HRTH\$T\%', parent: 'L2  (name)' },
              { type: 'file', name: 'L3-OK-File', parent: 'L2  (name)' },
              [
                { type: 'folder', name: ' ( lf)%jsL3i.foo', parent: 'L2  (name)' },
                [{ type: 'folder', name: 'L4 sjkl46j*^JH^H(', parent: ' ( lf)%jsL3i.foo' },
                ],
              ],
            ],
            [
              { type: 'folder', name: 'L2-OK-Folder', parent: 'L1 One' },
            ],
            [
              { type: 'folder', name: 'L2@,weird& - name/', parent: 'L1 One' },
              { type: 'file', name: 'L3 sfasda%^&FufgnSDF$#HRTH$T%', parent: 'L2@,weird& - name/' },
              { type: 'file', name: 'L3_OK-File.name.txt', parent: 'L2@,weird& - name/' },
              [
                { type: 'folder', name: 'L3h(lf)%jsi.foox ', parent: 'L2@,weird& - name/' },
                { type: 'file', name: 'L4 sjkl46j*^JH^H\(', parent: 'L3h(lf)%jsi.foox ' },
              ],
            ],
          ],
          [
            { type: 'folder', name: 'L1 three', parent: this.name },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 three' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</j', parent: 'L1 three' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 three' },
            { type: 'file', name: 'L2  x @#,$T%UG&.we', parent: 'L1 three' },
            [
              { type: 'folder', name: 'L2  \(na+me)x', parent: 'L1 three' },
              { type: 'file', name: 'L3 sfasda%^&Fuf\\gnSDF$#HRTH$T%' },
              [
                { type: 'folder', name: 'L3h(lf)%jsi.foo' },
                { type: 'file', name: 'L4 sjkl46j*^JH^H\(' },
              ],
            ],
            [
              { type: 'folder', name: 'L2@,weird& - name/', parent: 'L1 three' },
              { type: 'file', name: 'L3 sfasda%^&FufgnSDF$#HRT~H$T%', parent: 'L2@,weird& - name/' },
              [
                { type: 'folder', name: 'L3h(lf)%jsi.foo', parent: 'L2@,weird& - name/' },
                [
                  { type: 'folder', name: 'L4 sjkl46j*^JH^H(', parent: 'L3h(lf)%jsi.foo' },
                ],
              ],
            ],
          ],
          [
            { type: 'folder', name: 'L1 Two', parent: this.name },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 Two' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</j', parent: 'L1 Two' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 Two' },
            { type: 'file', name: 'L2 @#,$T%UG&.we', parent: 'L1 Two' },
            [
              { type: 'folder', name: 'L2  \(name)', parent: 'L1 Two' },
              { type: 'file', name: 'L3 sfasda%^&FufgnSDF$#HR\`TH$T%', parent: 'L2  \(name)' },
              [
                { type: 'folder', name: 'L3h(lf)%jsi.foo', parent: 'L2  \(name)' },
                { type: 'file', name: 'L4 sjkl46j*^JH^H(', parent: 'L3h(lf)%jsi.foo' },
              ],
            ],
            [
              { type: 'folder', name: 'L2@,weird& - name/', parent: 'L1 Two' },
              { type: 'file', name: 'L3 sfasda%^&FufgnSDF$#HRTH$T%', parent: 'L2@,weird& - name/' },
              [
                { type: 'folder', name: 'L3h(lf)%jsi.foo', parent: 'L2@,weird& - name/' },
                { type: 'file', name: 'L4 sjkl46j*^JH^H(', parent: 'L3h(lf)%jsi.foo' },
              ],
            ],
          ],
        ]
    }
  } // constructor

  /** ----------------------
   * @method Delete all of the test folders.
   */
  delTestFolder() {
    if (!this.exists) {
      console.warn('Folder "' + this.name + '" does not exist.');
      return;
    }
    if (!this.debug) {
      this.testFolder.setTrashed(true);
      this.exists = false;
      this.testFolder = null;
      this.testURL = '';
    }
    console.info('Moved folder ' + this.name + ' to trash.');
    this.ss.toast('Moved folder ' + this.name + ' to trash.', 'Notice', 30);
  } // delTestFolder

  /** ----------------------
   * @method Add the folders specified with this.size and this.name
   */
  addTestFolder() {
    try {
      if (this.exists) {
        console.warn('Folder ' + this.name + ' already exists. ' + this.testURL);
        return this.testURL;
      }
      console.time('addTestFolders');
      console.info('Creating: ' + this.name + ' size=' + this.size);
      this.testFolder = this.parentFolder.createFolder(this.name);
      this.testURL = this.testFolder.getUrl();
      this.exists = true;
      this._walkStructure(this.structure[this.size], this.testFolder, this.name);
      console.timeEnd('addTestFolders');
      return this.testURL;
    } catch (e) {
      console.error(e.stack);
      throw e;
    }
  } // addTestFolder

  /** ------
   * @method Recursevely step through the array structure to create the folders and files
   */
  _walkStructure(pArray, pFolder, pFolderName) {
    for (let tEl of pArray)
      if (Array.isArray(tEl))
        this._walkStructure(tEl, pFolder, pFolderName);
      else
        ({ pFolderName, pFolder } = this._processElement(tEl, pFolderName, pFolder));
  }

  _processElement(pEl, pFolderName, pFolder) {
    elParentMatches(pEl, pFolderName);
    if (pEl.type == 'file')
      return ({ pFolderName, pFolder } = this._createFile(pEl, pFolderName, pFolder));
    if (pEl.type == 'folder')
      return ({ pFolderName, pFolder } = this._createFolder(pEl, pFolderName, pFolder));
    throw new SyntaxError('Invalid type.');

    //END
    function elParentMatches(pEl, pFolderName) {
      if (pEl.name === '')
        throw new Error('Internal Error: missing name.');
      if (pEl.type === '')
        throw new Error('Internal Error: missing type.');
      if (pEl.parent != undefined && pEl.parent !== pFolderName)
        throw new SyntaxError('Bad structure. Expected: "' + pEl.parent + '"');
    }
  } // _processElement

  _createFolder(pEl, pFolderName, pFolder) {
    console.info('Create folder: "' + pEl.name + '" in "' + pFolderName + '"');
    pFolder = pFolder.createFolder(pEl.name);
    pFolderName = pEl.name;
    return { pFolderName, pFolder };
  }

  _createFile(pEl, pFolderName, pFolder) {
    console.info('Create file: "' + pEl.name + '" in "' + pFolderName + '"');
    pFolder.createFile(pEl.name, 'content');
    return { pFolderName, pFolder };
  }
} // TestSetup

/** ----------------------
 * @class
 * @classdesc Create test directory structure.
 * @param {obj} pArg = {name: 'test-tmp', size: 'large', debug: false}
 * @description Test with the simple structure. With debug==true, the output can be quickly verified.
 * @example tTestDirs = TestSetup({size: 'simple', debug: true});
 */
class walkFolderFiles {
  /** ---------------------
   * @method Get all the files in the folder (if showFiles).
   *  Create the row entry and push it to this.list.
   * @param {obj} pFolder
   */
  getFileList(pFolder = this.topFolder) {
    if (pFolder == null)
      throw new Error('this.topFolder is not set.');
    let tFile = null;
    let tRow = [];
    let tName = '';
    let tNewName = '';

    let tParentName = pFolder.getName();

    let tFileList = pFolder.getFiles();
    while (tFileList.hasNext()) {
      tFile = tFileList.next();
      tName = tFile.getName();
      tNewName = tName;
      if (this.rename)
        tNewName = this.replaceSpecial(tName);
      if (this.rename && this.onlyShowDiff && tNewName == tName)
        continue;
      tRow = [
        this.level,
        tParentName + '/',
        tName,
        tNewName,
        '=HYPERLINK("' + tFile.getUrl() + '", "Id")',
      ];
      this.list.push(tRow);
    }
  } // getFileList

  /** ---------------------
   * @method Get all the folders in the folder.
   * If showFolder, create the row entry and push it to this.list.
   * @param {obj} pFolder
   */
  getFolderList(pFolder = this.topFolder) {
    if (pFolder == null)
      throw new Error('this.topFolder is not set.');
    if (pFolder === this.topFolder) {
      this.list = [];
      this.level = 0;
    }
    let tFolder = null;
    let tRow = [];
    let tName = '';
    let tNewName = '';

    ++this.level;
    let tParentName = pFolder.getName();
    if (this.getFiles)
      this.getFileList(pFolder);

    let tFolderList = pFolder.getFolders();
    while (tFolderList.hasNext()) {
      tFolder = tFolderList.next();
      if (this.getFolders) {
        tName = tFolder.getName();
        tNewName = tName;
        if (this.rename)
          tNewName = this.replaceSpecial(tName);
        if (!(this.rename && this.onlyShowDiff && tNewName != tName)) {
          tRow = [
            this.level,
            tParentName + '/',
            tName + '/',
            tNewName + '/',
            '=HYPERLINK("' + tFolder.getUrl() + '", "Id")',
          ];
          this.list.push(tRow);
        }
      }
      if (this.level < this.levelLimit) {
        this.getFolderList(tFolder);
        --this.level;
      }
    }
  } // getFolderList
} // walkFolderFiles