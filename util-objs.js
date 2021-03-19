/**
 * $Source: /repo/public.cvs/app/gdrive-rename-files/github/util-objs.js,v $
 * @copyright $Date: 2021/03/19 18:25:36 $ UTC
 * @version $Revision: 1.8 $
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
 *  obj.name    - a class variable that a user can usually "get" or "set"
 *  obj._name   - a class variable that is assumed to be private (do not depend on it)
 *  obj.name()  - a class method
 *  _name()     - a function or method that is assumed to be private (do not depend on it)
 *  obj.uiName()- this method is probably called by a menuName() function
 *  menuName()  - a menu item is usually bound to these functions, and they call obj.uiName() methods
 *  fName()     - usually a global function
 */

/* ToDo List
 */
'use strict';

// ==============================================
// Functions

/**
 * This is a simple way of handling defaults for object params.
 */
function fDefault(pArg, pDefault) {
  if (pArg == 'undefined' || pArg == null || pArg == '')
    return pDefault;
  return pArg
}

/**
 * Return a default int for pArg.
 */
function fDefaultInt(pArg, pDefault) {
  if (pArg == 'undefined' || pArg == null || pArg == '' | pArg == NaN)
    return pDefault;
  pArg = Math.abs(pArg);
  pArg = Math.floor(pArg);
  if (pArg < pDefault)
    pArg = pDefault;
  return pArg
}    this.maxLevel = Math.floor(this.maxLevel);

/**
 * @returns Return just the Id part of a gdrive URL. See also: fHyper2Id()
 * @throw SyntaxError, Error, Exception
 * Exception.code an Exception.num can be used to ignore the exceptions. See fUrl2Id()
 */
function fUrl2IdStrict(pUrl) {
  if (typeof pUrl != 'string')
    throw new SyntaxError('Expected a string.');

  // Remove URL part of id
  // https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0
  let tRmSuffixAfterId = /\/(edit|view).*$/;
  pUrl = pUrl.replace(tRmSuffixAfterId, '');
  let tRmPathBeforeId = /.*\//g;
  pUrl = pUrl.replace(tRmPathBeforeId, '');

  _validateResult(); // this could change
  return pUrl;

  function _validateResult() {
    if (pUrl.length == 0)
      throw new Error('Invalid Id. Empty');
    if (pUrl.length != 33)
      throw new Exception('Invalid Id. Id should be 33 char long', 'length-problem', pUrl); // this could change
    if (pUrl[0] != '1')
      throw new Exception('Invalid Id. Id should begin with 1', 'prefix-problem', pUrl);
  }
} // fUrl2IdStrict

/**
 * @param {string} pUrl 
 * @returns gdrive Id
 * @throws SyntaxError, Error
 * This calls fUrl2IdStrict, but it removes the Exceptions that could change in the future.
 */
function fUrl2Id(pUrl) {
  try {
    return fUrl2IdStrict(pUrl);
  } catch (e) {
    if (e instanceof Exception && (e.code == 'length-problem' || e.code == 'prefix-problem')) {
      console.warn(e.toString());
      return e.num;
    } else {
      throw e;
    }
  }
} // fUrl2Id

/**
 * @param {string} pHyper
 * @returns gdrive Id
 * @throws SyntaxError, Error, Exception
 */
function fHyper2IdStrict(pHyper) {
  if (typeof pHyper != 'string')
    throw new SyntaxError('Expected a string.');
  // =HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")
  let tRmHyperPrefix = /.*HYPERLINK\("/;
  pHyper = pHyper.replace(tRmHyperPrefix, '');
  let tRmTitlePart = /",.*\)$/;
  return fUrl2IdStrict(pHyper.replace(tRmTitlePart, ''));
} // fHyper2IdStrict

/**
 * @param {string} pHyper 
 * @returns gdrive Id
 * @throws SyntaxEror, Error
 * This calls fHyper2IdStrict, but it removes the Exceptions that could change in the future.
 */
function fHyper2Id(pHyper) {
  try {
    return fHyper2IdStrict(pHyper);
  } catch (e) {
    if (e instanceof Exception && (e.code == 'length-problem' || e.code == 'prefix-problem')) {
      console.warn(e.toString());
      return e.num;
    } else {
      throw e;
    }
  }
} // fHyper2Id

function fHyper2Title(pHyper) {
  // Possible change: return URL if no title or empty
  // =HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Title")
  if (typeof pHyper != 'string')
    throw new SyntaxError('Expected a string.');

  let tRmLink = /.*HYPERLINK\("[^"]*"/;
  if (!tRmLink.test(pHyper))
    return pHyper;

  pHyper = pHyper.replace(tRmLink, '');

  let tRmQuote = /, *"/;
  if (!tRmQuote.test(pHyper))
    throw new Exception('Expected a title.', 'warn-no-title', 'fHyper2Title-1');
  pHyper = pHyper.replace(tRmQuote, '');

  let tRmLastPart = /"\)$/;
  pHyper = pHyper.replace(tRmLastPart, '');
  if (pHyper === '')
    throw new Exception('Expected a title.', 'warn-no-title', 'fHyper2Title-2');

  return pHyper;
} // fHyper2Title

/**
 * @param {string} pStr
 * @returns {string} Replace all special char with '_'
 * Allowed: a-zA-Z0-9._-
 * Repeated [._-] chars are removed, until only one of these remain.
 * [._-] cannot be at beginning or end of string, remove
 * [_-] cannot be before or after '.'
 */
function fReplaceSpecial(pStr) {
  let regEx = /./;
  let tResultNew = pStr.replace(regEx = /[^a-zA-Z0-9_.-]+/g, '_');
  let tResult = '';
  let tLimit = 5; // Just to be safe

  // Loop until there are no differences
  while (tResult != tResultNew) {
    if (--tLimit <= 0)
      throw new Error('Possible infinite loop.');
    tResult = tResultNew;
    _replaceOddPatterns();
  }
  return tResultNew;

  function _replaceOddPatterns() {
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
} // fReplaceSpecial

/**
 * @param {obj} pSS - spreadsheet handle
 * @param {string} pName - sheet name
 * @returns {obj} the active sheet
 * @throws Exception 'ss-error'
 * @example let st = fSelectSheet('foo');
 */
function fSelectSheet(pSS, pName) {
  _validateParams(pSS, pName);
  let st = pSS.getSheetByName(pName);
  if (st == null)
    st = pSS.insertSheet(pName);
  _validateResult(st, pName);
  st.activate();
  return st;

  function _validateParams(pSS, pName) {
    if (pSS == null)
      throw new Exception('There is no active SpreadSheet',
        'ss-error', 'fSelectSheet');
    if (typeof pName != 'string')
      throw new SyntaxError('Name is not a string.');
    if (pName == '')
      throw SyntaxError('Name is empty.');
  }

  function _validateResult(pSt, pName) {
    if (pSt == null)
      throw new Exception('Cannot create or select sheet: "' + pName + '"',
        'ss-error', 'fSelectSheet');
  }
} // fSelectSheet

// ==============================================
// Classes

/** ---------------------
 * @class
 * @classdesc Used to throw an Exception (non-error)
 * @param {string} pMessage
 * @param {string} pCode
 * @param {string} pNum
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
 * @param {obj} pArg = {name: 'test-tmp', size: 'large', custom: [], recreate: false, debug: false}
 * @description Test with the simple structure. With debug==true, the output can be quickly verified.
 * If size == 'custom' then use pArg.custom to define the array structure. The top parent for the
 * structure should be set to: 'custom-' + name
 * If a structure exists, it can be reused. But if it is change after creation, then pArg recreate: true should be added.
 * @example tTestDirs = TestSetup({size: 'simple', debug: true});
 */
class CreateFolderFiles {
  constructor(pArg = {}) {
    this.size = fDefault(pArg.size, 'large');     // Use predefined structure. If 'custom', pArg.custom will be used
    this.name = fDefault(pArg.name, 'test-tmp');  // Appended to this.size
    this.recreate = fDefault(pArg.recreate, false);  // If true, recreate structure, if it exists
    this.debug = fDefault(pArg.debug, false);     // Useful to debug the structure

    if (! ['small', 'simple', 'medium', 'large', 'custom'].includes(this.size))
      throw new SyntaxError('Not a valid size: ' + this.size);

    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.ui = SpreadsheetApp.getUi();
    let tFileInDrive = DriveApp.getFolderById(this.ss.getId()); // Note: this does not work right afer this.ss is set.
    this.parentFolder = tFileInDrive.getParents().next();

    this.topName = this.size + '-' + this.name;  // Top folder name in SS's directory
    this.testFolder = null;
    this.listOfHandles = [];  // This is only useful for debugging, the first time a structure is created.

    this.exists = this.parentFolder.getFoldersByName(this.topName).hasNext();
    if (this.exists) {
      this.testFolder = this.parentFolder.getFoldersByName(this.topName).next();
    }

    this.structure = {
      simple:
        [
          [
            { type: 'folder', name: 'folder1', parent: this.topName },
            { type: 'file', name: 'file1', parent: 'folder1' },
            [
              { type: 'folder', name: 'folder2', parent: 'folder1' },
              { type: 'file', name: 'file2', parent: 'folder2' },
            ],
            { type: 'file', name: 'file3', parent: 'folder1' },
          ],
          [
            { type: 'folder', name: 'folder3', parent: this.topName },
            [
              { type: 'folder', name: 'folder4', parent: 'folder3' },
              { type: 'folder', name: 'folder5', parent: 'folder4' },
            ],
          ],
          { type: 'file', name: 'file4', parent: this.topName },
        ],
      small:
        [
          { type: 'file', name: 'L1^bar', parent: this.topName },
          { type: 'file', name: 'L1:foo', parent: this.topName },
          { type: 'file', name: 'L1_this_is_OK', parent: this.topName },
          { type: 'file', name: 'L1_this_is_also_ok', parent: this.topName },
          [
            { type: 'folder', name: 'L1 One', parent: this.topName },
          ],
          [
            { type: 'folder', name: 'L1_this_folder-is-OK', parent: this.topName },
            { type: 'file', name: 'L2 uyi dg', parent: 'L1_this_folder-is-OK' },
            [
              { type: 'folder', name: 'L3h(lf)%jsi.foox ', parent: 'L1_this_folder-is-OK' },
              { type: 'file', name: 'L4 sjkl46j*^JH^H\(', parent: 'L3h(lf)%jsi.foox ' },
            ],
          ],
          [
            { type: 'folder', name: 'L1 three', parent: this.topName },
          ],
          [
            { type: 'folder', name: 'L1 Two', parent: this.topName },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 Two' },
            { type: 'file', name: 'L2 file with lots of spaces', parent: 'L1 Two' },

          ],
        ],
      medium:
        [
          { type: 'file', name: 'L1^bar', parent: this.topName },
          { type: 'file', name: 'L1:foo', parent: this.topName },
          [
            { type: 'folder', name: 'L1 One', parent: this.topName },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 One' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</jx ', parent: 'L1 One' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 One' },
            { type: 'file', name: 'L2-OK-File', parent: 'L1 One' },
            { type: 'file', name: 'L2 @#,$T%UG&.we/', parent: 'L1 One' },

          ],
          [
            { type: 'folder', name: 'L1 three', parent: this.topName },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 three' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</j', parent: 'L1 three' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 three' },
            { type: 'file', name: 'L2  x @#,$T%UG&.we', parent: 'L1 three' },

          ],
          [
            { type: 'folder', name: 'L1 Two', parent: this.topName },
            { type: 'file', name: '%*FYE $d ..L2 dg', parent: 'L1 Two' },
            { type: 'file', name: '-L2 a"lkj"569}{l/</j', parent: 'L1 Two' },
            { type: 'file', name: 'L2 @#$%%$^H\'DF\'DE$%^', parent: 'L1 Two' },
            { type: 'file', name: 'L2 @#,$T%UG&.we', parent: 'L1 Two' },
          ],
        ],
      large:
        [
          { type: 'file', name: 'L1^bar', parent: this.topName },
          { type: 'file', name: 'L1:foo', parent: this.topName },
          [
            { type: 'folder', name: 'L1 One', parent: this.topName },
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
            { type: 'folder', name: 'L1 three', parent: this.topName },
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
            { type: 'folder', name: 'L1 Two', parent: this.topName },
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

    if (this.size == 'custom') {
      if (pArg.custom == undefined || !Array.isArray(pArg.custom))
          throw new SyntaxError('pArg.custom is not defined or is not an array.');
      this.structure['custom'] = pArg.custom;
    }


    // This makes the "assertThrow" work for testing.
    this.addTestFolder = this.addTestFolder.bind(this);
  } // constructor

  /** ----------------------
   * @method Delete all of the test folders.
   */
  delTestFolder() {
    if (!this.exists) {
      if (this.debug) console.warn('Folder "' + this.topName + '" does not exist.');
      return 'Already deleted: ' + this.topName;
    }
    this.testFolder.setTrashed(true);
    this.exists = false;
    this.testFolder = null;
    this.listOfHandles = [];
    if (this.debug) console.info('Moved folder ' + this.topName + ' to trash.');
    this.ss.toast('Moved folder ' + this.topName + ' to trash.', 'Notice', 30);
    return 'Deleted: ' + this.topName;
  } // delTestFolder

  /** ----------------------
   * @method Add the folders specified with this.size and this.topName
   * @return testFolder handle.
   */
  addTestFolder() {
    try {
      if (this.exists && this.recreate)
        this.delTestFolder();
      if (this.exists) {
        console.warn('Folder ' + this.topName + ' already exists.');
        return this.testFolder;
      }

      console.time('addTestFolders');
      if (this.debug) console.info('Creating: ' + this.topName + ' size=' + this.size);
      this.testFolder = this.parentFolder.createFolder(this.topName);
      this.exists = true;

      this._walkStructure(this.structure[this.size], this.testFolder, this.topName);
      console.timeEnd('addTestFolders');

      return this.testFolder;
    } catch (e) {
      if (this.debug) console.error(e.stack);
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
      if (fDefault(pEl.name, '') == '')
        throw new Error('Internal Error: missing name.');
      if (fDefault(pEl.type, '') == '')
        throw new Error('Internal Error: missing type.');
      if (fDefault(pEl.parent, '') != '' && pEl.parent !== pFolderName)
        throw new SyntaxError('Bad structure. Expected: "' + pFolderName + '"');
    }
  } // _processElement

  _createFolder(pEl, pFolderName, pFolder) {
    if (this.debug) console.info('Create folder: "' + pEl.name + '" in "' + pFolderName + '"');
    pFolder = pFolder.createFolder(pEl.name);
    this.listOfHandles.push(pFolder);
    pFolderName = pEl.name;
    return { pFolderName, pFolder };
  }

  _createFile(pEl, pFolderName, pFolder) {
    if (this.debug) console.info('Create file: "' + pEl.name + '" in "' + pFolderName + '"');
    this.listOfHandles.push(pFolder.createFile(pEl.name, 'content'));
    return { pFolderName, pFolder };
  }
} // CreateFolderFiles

/** ----------------------
 * @class
 * @classdesc Walk a folder/file structure.
 * @param {obj} pArg = {topFolder: {obj}, collectObj: {obj}, 
 *    maxLevel: 1, incFiles: true, debug: false}
 * @throws topFolder not found
 * @throws collectObj not defined
 * @throws processFile or processFolder methods are not implemented on collectObj
 * @description Given the topFolder handle, walk across and down the folders(depth first).
 *  For each folder,
 *    call collectObj.processFolder. Stop when at maxLevel. If incFiles, 
 *    call collectObj.processFile, for each file in the current folder. 
 * @example tGetFolderFiles = new WalkFolderFiles({ topFolder: DriveApp.getFolderById(tId), 
 *    incFiles: true, collectObj: tGetList });
 * 
 * collectObj implements these callBack methods:
 *  pCollectObj.processFile(pArg = { element: {obj}, level: {num} });
 *  pCollectObj.processFolder(pArg = { element: {obj}, level: {num} });
 */
class WalkFolderFiles {
  constructor(pArg = {}) {
    this.collectObj = fDefault(pArg.collectObj, null);
    this.maxLevel = fDefaultInt(pArg.maxLevel, 1);
    this.incFiles = fDefault(pArg.incFiles, true);
    this.debug = fDefault(pArg.debug, false);

    if (this.collectObj == null)
      throw new SyntaxError('collectObj param is required.');
    if (!('parentPath' in this.collectObj))
      throw new SyntaxError('collectObj is missing parentPath property.');
    if (typeof this.collectObj.processElement !== 'function')
      throw new SyntaxError('processElement is missing from Collection obj');

    // This makes the "assertThrow" work for testing.
    this.start = this.start.bind(this);
  }

  start(pTopFolder) {
    if (fDefault(pTopFolder, null) == null)
      throw new SyntaxError('pTopFolder param is required.');
    this._walkFolders(pTopFolder, 1);
  }

  _walkFolders(pFolder, pLevel) {
    this.collectObj.parentPath.push(pFolder.getName());
    if (this.incFiles)
        this._getFiles(pFolder, pLevel);
    this._getFolders(pFolder.getFolders(), pFolder, pLevel);
    this.collectObj.parentPath.pop();
  }

  _getFiles(pFolder, pLevel) {
    let tFiles = pFolder.getFiles();
    while (tFiles.hasNext()) {
      let tFile = tFiles.next();
      if (this.debug) console.info('Got file: ' + tFile.getName());
      this.collectObj.processElement({ element: tFile, level: pLevel, type: '' });
    }
  }

  _getFolders(pFolderList, pFolder, pLevel) {
    while (pFolderList.hasNext()) {
      pFolder = pFolderList.next();
      if (this.debug) console.info('Got folder: ' + pFolder.getName());
      this.collectObj.processElement({ element: pFolder, level: pLevel, type: '/' });
      if (pLevel < this.maxLevel)
        this._walkFolders(pFolder, pLevel + 1);
    }
    return pFolder;
  }
} // WalkFolderFiles
