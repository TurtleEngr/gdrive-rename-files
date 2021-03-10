/**
 * $Source: /repo/public.cvs/app/gdrive-rename-files/github/test-rename-files.js,v $
 * @copyright $Date: 2021/03/03 04:01:47 $ UTC
 * @version $Revision: 1.7 $
 * @author TurtleEngr
 * @license https://www.gnu.org/licenses/gpl-3.0.txt
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
'use strict';

// ==============================================
// Define menus

/** ----------------------
 * @function This is called by the "top" onOpen menu function.
 * @param {obj} pUi - the ui handle for the SS
 * @param {obj} pMenu - the handle for the menu object
 */
function menuTestRename(pUi, pMenu) {
  pMenu = pMenu.addSeparator()
    .addSubMenu(pUi.createMenu('Test Replace')
      .addItem('Make Class', 'runMakeClass')
      .addItem('Replace Smoke Test', 'runReplaceSmokeTest')
      .addItem('Replace Many Test', 'runReplaceTestMany')
      .addItem('Check Config', 'runCheckConfig')
      .addItem('Get Files Test', 'runGetFilesTest')
      .addItem('Get Files UI', 'runGetFilesUi')
      .addItem('Rename Files Test', 'runRenameFiles')
      .addItem('Undo Files Test', 'runUndoFiles')
      .addItem('RunAll Test', 'runAllTests')
      .addItem('Clean Up', 'runCleanup')
    );
  if (typeof menuGsUnitTest === 'function')
    pMenu = menuGsUnitTest(pUi, pMenu);
  return pMenu;
}

// ======================================
/* Run Unit Tests - Select the tests to be run.
 * (no args so they can be called by the UI menu)
 */

/** ----------------------
 * @function Cleanup after all tests.
 */
function runCleanup() {
  let testF = new TestSetup();
  testF.delTestFolder();
} // runCleanup

/** ----------------------
 * @function Run all the unit tests. List them in the array passed to runTests.
 */
function runAllTests() {
  let tSetup = new TestSetup();
  if (tSetup.exists)
    tSetup.delTestFolder();
  runTests([makeClassUnit, replaceSmokeUnit, replaceTestManyUnit, checkConfigUnit, getFilesUnit,
    getFilesUiUnit, renameFilesUnit, undoFilesUnit])
}

/** ----------------------
 * @function Verify the RenameFiles class is created OK.
 */
function runMakeClass() {
  runTests([makeClassUnit]);
}

/** ----------------------
 * @function Verify the Replace method is working OK.
 */
function runReplaceSmokeTest() {
  runTests([replaceSmokeUnit]);
}

/** ----------------------
 * @function Replace a lot of names.
 */
function runReplaceTestMany() {
  runTests([replaceTestManyUnit]);
}

/** ----------------------
 * @function Verify the getConfig is working for all pass/fail checks
 */
function runCheckConfig() {
  runTests([checkConfigUnit]);
}

/** ----------------------
 * @function Verify GetFiles is functional.
 */
function runGetFilesTest() {
  runTests([getFilesUnit]);
}

/** ----------------------
 * @function Verify GetFiles works for edge cases.
 */
function runGetFilesTest2() {
  runTests([getFilesUnit2]);
}

/** ----------------------
 * @function Verify the GetFiles UI is working.
 */
function runGetFilesUi() {
  runTests([getFilesUiUnit]);
}

/** ----------------------
 * @function Verify RenameList is functional.
 */
function runRenameFiles() {
  runTests([renameFilesUnit]);
}

/** ----------------------
 * @function Verfify UndoList is functional.
 */
function runUndoFiles() {
  runTests([undoFilesUnit]);
}

/** -------------------------------------------------------
 * @function Run the tests specified with the above functions.
 * @param {array} pTestFun - this will be one or more function names.
 */
function runTests(pTestFun = []) {
  console.time('runTests');

  var tUnit = new GsUnit({ name: 'base', debug: false });

  let tRun = new RunTests({ name: "TestReplace", debug: false, gsunit: tUnit });
  tRun.debug = false;
  tRun.showPass = true;
  tRun.showInConsole = true;
  tRun.showToast = false;
  tRun.showInSheet = true;
  tRun.showResults = true;

  tRun.resetTests();
  for (let tTest of pTestFun)
    tTest(tRun, tUnit);
  tRun.runTests();

  //tRun.testResults();
  console.timeEnd('runTests');
} // runTests

// ==============================================
// Support functions for the Unit Tests

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
 * @function Set all of the Interface UI cells to the default values in uiMap
 */
function setDefaults(pRenObj) {
  let tDefaultValues = [];
  for (let tKey in pRenObj.uiMap)
    tDefaultValues.push([pRenObj.uiMap[tKey].value]);
  pRenObj.stu.getRange(pRenObj.uiRange.cell).setValues(tDefaultValues).setBackground('white');
} // setDefaults

/** ----------------------
 * @function Set one or more paticular Interface UI cells to the passed values.
 * @param {obj} pRenObj
 * @param {obj} pArg - list of name:value pairs. {name: value, name: value, ...}
 *  where "name" is a uiMap key.
 */
function setUiFields(pRenObj, pArg = {}) {
  for (let tKey in pArg)
    pRenObj.stu.getRange(pRenObj.uiMap[tKey].cell).setBackground('white').setValue(pArg[tKey]);
} // setDefaults

/** ----------------------
 * @function This is a set of common setup steps that are used by many Unit Tests.
 * @description Create test files. Set pArg.obj to top folder. Setup default values in SS. Get config vars from SS.
 * If pArg.reset is true, delete the struct and recreate.
 * @param {obj} pArg - {obj: RenObj, size: SetupSize, reset: Setup.delTestFolder?}
 * @return Setup obj
 */
function setupTestFolders(pArg = {}) {
  let pRenObj = pArg.obj;  // required
  let pSize = pArg.size == undefined ? 'large' : pArg.size;  // Dir struct size
  let pResetUp = pArg.reset == undefined ? false : pArg.reset;
  let tSetup = new TestSetup({ size: pSize });
  if (tSetup.exists && pResetUp)
    tSetup.delTestFolder();
  pRenObj._setTopFolderById(tSetup.addTestFolder());
  setDefaults(pRenObj);
  pRenObj._getConfig();
  return tSetup;
} // setupTestFolders

// ==============================================
// Define the Unit Tests

/** ----------------------
 * @function Assertions for creation of RenameFiles class.
 */
function makeClassUnit(pTest, pUnit) {
  // ------
  pTest.addTest(testRenameClass);
  function testRenameClass() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });

    pUnit.assertEqual('Create class. Get name.', tRenObj.sheetLog, 'RenameList', 'mcu1');

    tRenObj._selectSheet('RenameList');
    pUnit.assertEqual('RenameList is active.', tRenObj.ss.getActiveSheet().getName(), tRenObj.sheetLog, 'mcu2');

    tRenObj._selectSheet('Interface');
    pUnit.assertEqual('Interface is active.', tRenObj.ss.getActiveSheet().getName(), tRenObj.sheetUI, 'mcu3');

    tRenObj.stl.activate();
    pUnit.assertEqual('RenameList is active.', tRenObj.ss.getActiveSheet().getName(), 'RenameList', 'mcu4');

    //tRenObj.stu.activate();
    //pUnit.assertEqual('Interface is active.', tRenObj.ss.getActiveSheet().getName(), 'Interface', 'mcu5');
  }
} // makeClassUnit

/** ----------------------
 * @function Test the replaceSpecial method
 */
function replaceSmokeUnit(pTest, pUnit) {
  // ------
  pTest.addTest(testReplace_1);
  function testReplace_1() {
    let tIn;
    let tOut;

    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });

    tIn = 'a#A@@cde-fg.hi_jk';
    tOut = 'a_A_cde-fg.hi_jk';
    pUnit.assertEqual('replace non-alphanum', tRenObj.replaceSpecial(tIn), tOut, 'tr1.1');

    tIn = 'a#A@@cde-fg.hi_jk^l99!!8.foo';
    tOut = 'a_A_cde-fg.hi_jk_l99_8.foo';
    pUnit.assertEqual('replace non-alphanum', tRenObj.replaceSpecial(tIn), tOut, 'tr1.2');

    tIn = 'a\\b\'c\"d\(e\)f&g';
    tOut = 'a_b_c_d_e_f_g';
    pUnit.assertEqual('replace escaped char', tRenObj.replaceSpecial(tIn), tOut, 'tr1.3');

    tIn = 'a\\b\'c\"d!e@f#g$h%i^j&k*l(m)n_o+p-q=r[s]t{u}v|w;x:y,z.< >/?';
    tOut = 'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p-q_r_s_t_u_v_w_x_y_z';
    //                a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p-q_r_s_t_u_v_w_x_y_z._
    pUnit.assertEqual('Check all special char', tRenObj.replaceSpecial(tIn), tOut, 'tr1.4');

    tIn = '@@a-foo)';
    tOut = 'a-foo';
    pUnit.assertEqual('Fix leading and trailing special char', tRenObj.replaceSpecial(tIn), tOut, 'tr1.5');

    tIn = '@@a - b also- / -(xxy).foo';
    tOut = 'a-b_also-xxy.foo';
    pUnit.assertEqual('Fix middle mess-1', tRenObj.replaceSpecial(tIn), tOut, 'tr1.6');

    tIn = '@@a - b a___l---s...o- / -(xxy).foo';
    tOut = 'a-b_a_l-s.o-xxy.foo';
    pUnit.assertEqual('Fix middle mess-2', tRenObj.replaceSpecial(tIn), tOut, 'tr1.7');

    tIn = 'a--_--b-_c_-d_-_-e';
    tOut = 'a-b-c_d-e';
    pUnit.assertEqual('More fix middle mess-3', tRenObj.replaceSpecial(tIn), tOut, 'tr1.8');
  }
} // replaceSmokeUnit

/** ----------------------
 * @function Test replacing many strings.
 */
function replaceTestManyUnit(pTest, pUnit) {
  // ------
  pTest.addTest(testReplaceMany);
  function testReplaceMany() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    // {'ExpectedOutput': 'Input', ...}
    let tList = {
      '1-PRELUDE-It_s_Just_There_by_Many_of_One_Jazz_Band-jazzicalmusic.com.mp3':
        '1 - PRELUDE - It\'s Just There by Many of One Jazz Band - jazzicalmusic.com.mp3',
      '173_ITB_SPG-pno_201104.mp3':
        '173 ITB SPG-pno 201104.mp3',
      '173_In_the_Branches_201110_final_mix.mp3':
        '173 In the Branches 201110 final mix.mp3',
      '2-OPENING_HYMN-173_In_the_Branches_201110_final_mix.mp3':
        '2 - OPENING HYMN - 173 "In the Branches" 201110 final mix.mp3',
      '3-JOYS_CONCERNS-City_Lights-Ola_Gjeilo-Shauna_Pickett-Gordon_piano_201016-FINAL.mp3':
        '3 - JOYS CONCERNS - City Lights - Ola Gjeilo - Shauna Pickett-Gordon, piano 201016 - FINAL?.mp3',
      '4-MOMENT_REFLECTION-Wind_Chimes_Bird_Song_2020-10-02.mp3':
        '4 - MOMENT REFLECTION - Wind Chimes Bird Song_2020-10-02.mp3',
      '6-HYMN_REFLECTION-HGTA_201111_final_mix.mp3':
        '6 - HYMN REFLECTION - HGTA 201111 final mix.mp3',
      '7-OFFERTORY_Bis_du_bei_mir-GBencze_sop_SPG_pno-from_Shauna_201112.mp3':
        '7 - OFFERTORY -Bis du bei mir - GBencze sop + SPG pno - from Shauna 201112.mp3',
      'BDBM-SPG-pno.mp3':
        'BDBM - SPG-pno.mp3',
      'Bis_du_bei_mir-GBencze_sop_SPG_pno.mp3':
        'Bis du bei mir - GBencze sop + SPG pno.mp3',
      'City_Lights-Ola_Gjeilo-Shauna_Pickett-Gordon_piano_201016.mp3':
        'City Lights - Ola Gjeilo - Shauna Pickett-Gordon, piano 201016.mp3',
      'City_Lights-Ola_Gjeilo-Shauna_Pickett-Gordon_piano_201016.mp3':
        'City_Lights-Ola_Gjeilo-Shauna_Pickett-Gordon_piano_201016.mp3',
      'Gather-1-In_the_Branches_of_the_Forest-UU_173.mp3':
        'Gather-1 - In the Branches of the Forest - UU # 173.mp3',
      'Gather-2-HGTA_SPG-pno_201104.mp3':
        'Gather-2 - HGTA SPG-pno 201104.mp3',
      'HGTA_201111_final_mix.mp3':
        'HGTA 201111 final mix.mp3',
      'HGTA_SPG-pno_201104.mp3':
        'HGTA SPG-pno 201104.mp3',
      'HGTA_SPG-pno_201104.mp3':
        'HGTA_SPG-pno_201104.mp3',
      'Have_You_Been_to_Jail_for_Justice-Mo-2021-02-01.mp3':
        'Have You Been to Jail for Justice-Mo-2021-02-01.mp3',
      'Holy_Now-Peter_Mayer_with_lyrics_in_captions.mp4':
        'Holy Now - Peter Mayer (with lyrics in captions).mp4',
      'Hymn-213_There_s_a_wideness_in_your_mercy_piano_TDvocal_2021-02-04.mp3':
        'Hymn-213 "There\'s a wideness in your mercy" piano (TDvocal)-2021-02-04.mp3',
      'Hymn-213_piano_solo_2021-02-04.mp3':
        'Hymn-213 piano solo 2021-02-04.mp3',
      'In_the_Branches_of_the_Forest-UU_173.mp3':
        'In the Branches of the Forest - UU # 173.mp3',
      'It_s_Just_There_by_Many_of_One_Jazz_Band_from_jazzicalmusic.com.mp3':
        'It\'s "Just There by Many of One Jazz Band" -from jazzicalmusic.com.mp3',
      'It_s_Just_There.mp3':
        'It\'s Just There.mp3',
      'MC_tutti_201110.mp3':
        'MC tutti 201110.mp3',
      'Surah_Al-Fatiha_by_Jennifer_Grout_2021-01-31.mp3':
        'Surah Al-Fatiha, by Jennifer Grout: 2021-01-31.mp3',
      'final-Rob':
        'final - Rob',
      'hymn-170_We_Are_a_Gentle_Angry_People-2021-02-02.mp3':
        'hymn-170 We Are a Gentle Angry People-2021-02-02.mp3',
      'music_final-Rob_5-METTA_CHANT-MC_tutti_201110-UUCC_Meta_Chant_from_Shauna_201110.mp3':
        'music/final - Rob/5 - METTA CHANT - MC tutti 201110 - UUCC Meta Chant from Shauna 201110.mp3',
      'UUCC_OOS_2020Jun21_supplement_rev_2020Jun21':
        'UUCC OOS 2020Jun21 supplement (rev 2020Jun21)',
      'Copy_of_TechScript_2020June21_last_edited_6_20_2020':
        'Copy of TechScript 2020June21(last edited 6/20/2020)'
    }
    let i = 0;
    for (let tExpect in tList) {
      console.info(++i + " '" + tExpect + "':\n\t'" + tList[tExpect] + "',");
      pUnit.assertEqual('replace', tRenObj.replaceSpecial(tList[tExpect]), tExpect, 'trm.' + i);
    }
  }

  // ------
  pTest.addTest(testReplaceManyTmp);
  function testReplaceManyTmp() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    // {'ExpectedOutput': 'Input', ...}
    let tExpectList = {
      'test-tmp':
        'test-tmp',
      'L1_One':
        'L1 One',
      'L2_name':
        'L2  (name)',
      'L3h_lf_jsi.foo':
        'L3h(lf)%jsi.foo',
      'L4_sjkl46j_JH_H':
        'L4 sjkl46j*^JH^H(',
      'L3_sfasda_FufgnSDF_HRTH_T':
        'L3 sfasda%^&FufgnSDF$#HRTH$T%',
      'L2_weird-name':
        'L2@,weird& - name',
      'L2_a_lkj_569_l_j':
        '-L2 a"lkj"569}{l"/</j',
      'FYE_d.L2_dg':
        '%*FYE $d ..L2 dg',
      'L2_H_DF_DE':
        'L2 @#$%$^H\'DF\'DE$%^',
      'L2_T_UG.we':
        'L2 @#,$T%UG&.we',
      'L1_three':
        'L1 three',
      'L1_Two':
        'L1 Two',
      'L1_bar':
        'L1^bar',
      'L1_foo':
        'L1:foo'
    }
    let i = 0;
    for (let tExpect in tExpectList) {
      //console.info(++i + " '" + tRenObj.replaceSpecial(tExpect) + "':\n\t'" + tExpect + "',");
      console.info(++i + " '" + tExpect + "':\n\t'" + tExpectList[tExpect] + "',");
      pUnit.assertEqual('replace', tRenObj.replaceSpecial(tExpectList[tExpect]), tExpect, 'trmt-' + i);
    }
  }
} // replaceTestManyUnit

/** ----------------------
 * @function Test getConfig
 */
function checkConfigUnit(pTest, pUnit) {
  // --------
  pTest.addTest(testValidatePass);
  function testValidatePass() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });

    let tTrue = ['y', 'yes', 'YEs', 't', 'True', '1', 1];
    let tValues = [];
    for (let i in tTrue) {
      tValues[tRenObj.uiMap['empty1'].index] = [tTrue[i]];
      pUnit.assertTrue('Test _verifyTF', tRenObj._verifyTF('empty1', tValues), 'tvpt' + i);
    }

    let tFalse = ['n', 'NO', 'F', 'False', '0', 0];
    for (let i in tFalse) {
      tValues[tRenObj.uiMap['empty1'].index] = [tFalse[i]];
      pUnit.assertFalse('Test _verifyTF', tRenObj._verifyTF('empty1', tValues), 'tvpf' + i);
    }
  } // testValidatePass

  // --------
  pTest.addTest(testValidateFail);
  function testValidateFail() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });

    let tFail = ['y es', 'yfoo', 'foo', '10', 'n0', ' no', 'false '];
    let tValues = [];
    for (let i in tFail) {
      try {
        tValues[tRenObj.uiMap['empty1'].index] = [tFail[i]];
        tRenObj._verifyTF('empty1', tValues);
        pUnit.fail('Error was not detected.', 'tvf1.' + i);
      } catch (e) {
        if (e instanceof Exception) {
          // Check for expected exceptions
          pUnit.assertEqual('Check cell.', e.num, tRenObj.uiMap['empty1'].cell, 'tvf2.' + i);
          pUnit.assertEqual('Check msg.', e.message, 'Invalid value', 'tvf3.' + i);
        } else {
          pUnit.fail('Unexpected error: ' + e.toString(), 'tvf4.' + i);
        }
      }
    }
  } // testValidateFail

  // --------
  pTest.addTest(testGetConfig);
  function testGetConfig() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    // Set to false so you can watch the UI change on Interface sheet
    //pTest.showPass = false;
    //pTest.showResults = false;
    let tSetup = new TestSetup();

    let tTest = 'tgc1';
    let tFolderURL = tSetup.addTestFolder('test-tmp'); // create test folders in SS parent folder
    pUnit.assertTrue('Does test folder exist.', tSetup.exists, tTest + '.1');
    tRenObj._setTopFolderById(tFolderURL);
    pUnit.assertEqual('Folder URL.', tRenObj.topFolder.getName(), 'test-tmp', tTest + '.2');
    pUnit.assertEqual('Folder Name.', tRenObj.stu.getRange(tRenObj.uiInfo.topFolderName.cell).getValue(), 'test-tmp', tTest + '.3');

    tTest = 'tgc2';
    tRenObj.topFolderId = tSetup.addTestFolder();
    pUnit.assertEqual('Folder Name', tRenObj.topFolderId, tFolderURL, tTest);

    setDefaults(tRenObj);
    tRenObj._getConfig();

    let tBadValue = { 'topFolderId': 'XXX', 'getFolders': 'foo', 'getFiles': 'foo', 'levelLimit': 0, 'rename': 'bar', 'onlyShowDiff': 'foo', 'saveLog': 'bar' };
    for (let tCell in tBadValue) {
      try {
        setDefaults(tRenObj);
        // Define a bad value
        setUiFields(tRenObj, { [tCell]: tBadValue[tCell] });
        tRenObj._getConfig();
        pUnit.fail('Error was not detected.', 'tgc3.' + tCell);
      } catch (e) {
        if (e instanceof Exception) {
          pUnit.assertEqual('Check cell.', e.num, tRenObj.uiMap[tCell].cell, 'tgc4.' + tCell);
          if (e.num === tRenObj.uiMap.topFolderId.cell)
            pUnit.assertEqual('Check msg.', e.message, 'Top Folder Id not found.', 'tgc3.' + tCell);
          else
            pUnit.assertEqual('Check msg.', e.message, 'Invalid value', 'tgc5.' + tCell);
        } else {
          console.error(e.stack)
          pUnit.fail('Unexpected error: ' + e.toString(), 'tgc6.' + tCell);
        }
      }
    }
    setDefaults(tRenObj);
    tRenObj._getConfig();
  } // testGetConfig
} // checkConfigUnit

/** ----------------------
 * @function Test getFile functionality.
 */
function getFilesUnit(pTest, pUnit) {
  // ------
  pTest.addTest(testGetFiles);
  function testGetFiles() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });

    tRenObj.list = [];
    tRenObj.getFileList(tRenObj.topFolder);
    let tRange = tRenObj.list;
    pUnit.assertEqual('getFiles, parent folder', tRange[0][1], 'test-tmp/', 'tgf1');

    tRenObj.list = [];
    tRenObj.getFileList();
    let tRange2 = tRenObj.list;
    let tExpect = '0,test-tmp/,L1:foo,L1_foo,0,test-tmp/,L1^bar,L1_bar';
    let tRemoveHyperLink = /,=HYPERLINK\([^)]*\)/g;
    let tGot = tRange2.toString().replace(tRemoveHyperLink, '');
    pUnit.assertEqual('getFiles Output', tGot, tExpect, 'tgf2');

    tRenObj.level = 1;
    tRenObj.getFiles = false;
    tRenObj.getFolderList();
    tRange2 = tRenObj.list;
    console.info(tRange2);
    tExpect = '1,test-tmp/,L1 Two/,L1_Two/,1,test-tmp/,L1 three/,L1_three/,1,test-tmp/,L1 One/,L1_One/';
    let regEx = /,=HYPERLINK\([^)]*\)/g
    tGot = tRange2.toString().replace(regEx, '');
    pUnit.assertEqual('getFolders Output', tGot, tExpect, 'tgf3');

    tRenObj.level = 1;
    tRenObj.getFiles = true;
    tRenObj.getFolders = true;
    tRenObj.rename = true;
    tRenObj.onlyShowDiff = false;
    tRenObj.getFolderList();
    tRange2 = tRenObj.list;
    tGot = tRange2.toString().replace(regEx = /,=HYPERLINK\([^)]*\)/g, '');
    //if (pTest.debug)
    //  console.info(tRange2);
    pUnit.assertStrContains('Get folders and files.', tGot, 'test-tmp/', 'tgf.1');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_One/', 'tgf4.2');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_Two/', 'tgf4.3');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_three/', 'tgf4.4');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_bar', 'tgf4.5');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_foo', 'tgf4.6');

    pUnit.assertStrNotContains('Get folders and files.', tGot, 'FYE_d.L2_dg', 'tgf4.7');
    pUnit.assertStrNotContains('Get folders and files.', tGot, 'L2_H_DF_DE', 'tgf4.8');
    pUnit.assertStrNotContains('Get folders and files.', tGot, 'L2_T_UG.we', 'tgf4.9');
    pUnit.assertStrNotContains('Get folders and files.', tGot, 'L2_a_lkj_569_l_j', 'tgf4.10');
  } // testGetFiles

  // ------
  pTest.addTest(testGetRecurse1);
  function testGetRecurse1() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });

    tRenObj.level = 10;
    tRenObj.getFiles = true;
    tRenObj.getFolders = true;
    tRenObj.rename = true;
    tRenObj.onlyShowDiff = false;
    tRenObj.levelLimit = 10;
    tRenObj.getFolderList();
    let tRange1 = tRenObj.list;
    let regEx = /,=HYPERLINK\([^)]*\)/g
    let tGot = tRange1.toString().replace(regEx, '');
    if (pTest.debug) {
      //console.info(tRange1);
      console.info(tGot);
    }
    let tExpectList = {
      'L1^bar': 'L1_bar',
      'L1:foo': 'L1_foo',
      'L1 One/': 'L1_One/',
      'L1 three/': 'L1_three/',
      'L1 Two/': 'L1_Two/',
      '%*FYE $d ..L2 dg': 'FYE_d.L2_dg',
      '-L2 a"lkj"569}{l/</jx ': 'L2_a_lkj_569_l_jx',
      'L2 @#$%%$^H\'DF\'DE$%^': 'L2_H_DF_DE',
      'L2  (name)/': 'L2_name/',
      'L2 @#,$T%UG&.we/': 'L2_T_UG.we',
      'L2@,weird& - name//': 'L2_weird-name/',
      'L2-OK-File': 'L2-OK-File',
      'L2-OK-Folder/': 'L2-OK-Folder/',
      '%*FYE $d ..L2 dg': 'FYE_d.L2_dg',
      '-L2 a"lkj"569}{l/</j': 'L2_a_lkj_569_l_j',
      'L2 @#$%%$^H\'DF\'DE$%^': 'L2_H_DF_DE',
      'L2  (na+me)x/': 'L2_na_me_x/',
      'L2@,weird& - name//': 'L2_weird-name/',
      'L2  x @#,$T%UG&.we': 'L2_x_T_UG.we',
      '%*FYE $d ..L2 dg': 'FYE_d.L2_dg',
      '-L2 a"lkj"569}{l/</j': 'L2_a_lkj_569_l_j',
      'L2 @#$%%$^H\'DF\'DE$%^': 'L2_H_DF_DE',
      'L2  (name)/': 'L2_name/',
      'L2 @#,$T%UG&.we': 'L2_T_UG.we',
      'L2@,weird& - name//': 'L2_weird-name/',
      'L3 sfasda%^&Fuf\gnSDF$#HRTH$T%': 'L3_sfasda_Fuf_gnSDF_HRTH_T',
      'L3h(lf)%jsi.foo/': 'L3h_lf_jsi.foo/',
      'L3 sfasda%^&FufgnSDF$#HR`TH$T%': 'L3_sfasda_FufgnSDF_HR_TH_T',
      'L3 sfasda%^&FufgnSDF$#HRTH$T%': 'L3_sfasda_FufgnSDF_HRTH_T',
      'L3-OK-File': 'L3-OK-File',
      'L3h(lf)%jsi.foo/': 'L3h_lf_jsi.foo/',
      ' ( lf)%jsL3i.foo/': 'lf_jsL3i.foo/',
      'L3_OK-File.name.txt': 'L3_OK-File.name.txt',
      'L3 sfasda%^&FufgnSDF$#HRT~H$T%': 'L3_sfasda_FufgnSDF_HRT_H_T',
      'L3 sfasda%^&FufgnSDF$#HRTH$T%': 'L3_sfasda_FufgnSDF_HRTH_T',
      'L3 sfasda%^&FufgnSDF$#HRTH$T%': 'L3_sfasda_FufgnSDF_HRTH_T',
      'L3h(lf)%jsi.foo/': 'L3h_lf_jsi.foo/',
      'L3h(lf)%jsi.foo/': 'L3h_lf_jsi.foo/',
      'L3h(lf)%jsi.foox /': 'L3h_lf_jsi.foox/',
      'L4 sjkl46j*^JH^H(/': 'L4_sjkl46j_JH_H/',
      'L4 sjkl46j*^JH^H(': 'L4_sjkl46j_JH_H',
      'L4 sjkl46j*^JH^H(': 'L4_sjkl46j_JH_H',
      'L4 sjkl46j*^JH^H(': 'L4_sjkl46j_JH_H',
      'L4 sjkl46j*^JH^H(/': 'L4_sjkl46j_JH_H/',
      'L4 sjkl46j*^JH^H(': 'L4_sjkl46j_JH_H',
    }
    for (let i in tExpectList) {
      pTest.debugMsg('tgr1 check: ' + i + ': ' + tExpectList[i]);
      pUnit.assertStrContains('Check for renamed file or folder.', tGot, tExpectList[i], 'tgr1');
    }
  } // testGetRecurse1

  // ------
  pTest.addTest(testGetRecurse2);
  function testGetRecurse2() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });

    tRenObj.level = 10;
    tRenObj.getFiles = false;
    tRenObj.getFolders = true;
    tRenObj.rename = true;
    tRenObj.onlyShowDiff = true;
    tRenObj.levelLimit = 10;
    tRenObj.getFolderList();
    let tRegEx = /\/$/;
    for (let i in tRenObj.list) {
      pTest.debugMsg('tgr2 check: "' + tRenObj.list[i][2] + '" "' + tRenObj.list[i][3] + '"');
      pUnit.assertNotEqual('Only get Diff.', tRenObj.list[i][2], tRenObj.list[i][3], 'tgr2.1.' + i)
      pUnit.assertTrue('Only get folders.', tRegEx.test(tRenObj.list[i][3]), 'tgr2.2.' + i);
    }
  } // testGetRecurse2
} // getFilesUnit

/** ----------------------
 * @function Test getFile functionality.
 */
function getFilesUnit2(pTest, pUnit) {
  // ------
  pTest.addTest(testGetSomeFiles);
  function testGetSomeFiles() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj, size: 'small', reset: true });

    tRenObj.list = [];
    tRenObj.level = 10;
    tRenObj.getFiles = true;
    tRenObj.getFolders = true;
    tRenObj.rename = false;
    tRenObj.onlyShowDiff = false;
    tRenObj.getFolderList();
    let tRange = tRenObj.list;
    console.info(tRange);
    let tExpect = '0,test-tmp/,L1:foo,L1_foo,0,test-tmp/,L1^bar,L1_bar';
    let tRemoveHyperLink = /,=HYPERLINK\([^)]*\)/g;
    let tGot = tRange.toString().replace(tRemoveHyperLink, '');
    pUnit.assertEqual('getFiles Output', tGot, tExpect, 'tgsf1');
  } // testGetSomeFiles
} // getFilesUnit2

/** ----------------------
 * @function Test getFiles from a UI perspective.
 */
function getFilesUiUnit(pTest, pUnit) {
  // ------
  pTest.addTest(getFilesUi_1);
  function getFilesUi_1() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });

    menuGetList();

    tRenObj.stu.activate();
    let tRange = tRenObj.stl.getRange('A1:E7').setBackground('white');
    let tValues = tRange.getValues();
    let tValuesFlat = tValues.flat(1);
    //if (this.debug)
    //  console.info('tValues:');
    //  console.info(tValues);

    let tExpect = [
      ['Level', 'ParentFolder', 'CurrentName', 'NewName', 'Link'],
      [1, 'test-tmp/', 'L1^bar', 'L1_bar', 'Id'],
      [1, 'test-tmp/', 'L1:foo', 'L1_foo', 'Id'],
      [1, 'test-tmp/', 'L1 One/', 'L1_One/', 'Id'],
      [1, 'test-tmp/', 'L1 three/', 'L1_three/', 'Id'],
      [1, 'test-tmp/', 'L1 Two/', 'L1_Two/', 'Id'],
      ['', '', '', '', '']
    ];
    let tExpectFlat = tExpect.flat(1);
    //console.info(tExpectFlat);
    pUnit.assertArrayEqual('Check default Ui get files list.', tValuesFlat, tExpectFlat, 'gfu1')
  } // getFilesUi_1
} // getFilesUiUnit

/** ----------------------
 * @function Test RenameList
 */
function renameFilesUnit(pTest, pUnit) {
  // ------
  pTest.addTest(renameFiles_1);
  function renameFiles_1() {
    let tExpectIdList = [];
    let tExpectList = [];
    let tExpectName = '';
    let tExpectYes = '';
    let tGotId = '';
    let tGotName = '';
    let tIsFolder = /\/$/;
    let tRow = 0;

    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    // Force test-tmp to small set of files.
    let tSetup = setupTestFolders({ obj: tRenObj, size: 'small', reset: true });

    menuGetList();
    tRenObj.renameList();

    tExpectList = tRenObj.stl.getRange('C2:F6').getValues();   // row[0..4] col[0..3]
    tExpectIdList = tRenObj.stl.getRange('E2:E6').getFormulas(); // row[0..4] col[0] hyperlinks
    let tColMap = { CurrentName: 0, NewName: 1, Link: 2, Renamed: 3, Hyper: 0 };
    console.info(tExpectList);

    // for each row (0 to 4)
    for (tRow in tExpectList) {
      tGotId = tRenObj._hyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
      console.info('tGotId=' + tGotId);
      tExpectName = tExpectList[tRow][tColMap.NewName];
      console.info('tExpecName=' + tExpectName);
      if (tIsFolder.test(tExpectName))
        tGotName = DriveApp.getFolderById(tGotId).getName() + '/';
      else
        tGotName = DriveApp.getFileById(tGotId).getName();
      pUnit.assertEqual('Verify renamed file/folder.', tGotName, tExpectName, 'rfu1.1-row-' + tRow + 2);
      tExpectYes = tExpectList[tRow][tColMap.Renamed];
      pUnit.assertEqual('', tExpectYes, 'yes', 'rfu1.2-row-' + tRow + 2);
    }

    setUiFields(tRenObj, { onlyShowDiff: 'yes' });
    tRenObj = menuGetList();
    //console.info(tRenObj.list);
    pUnit.assertEqual('Should find no files.', tRenObj.error.code, 'empty-list', 'rfu3');
  } // renameFiles_1

  // ------
  pTest.addTest(renameFiles_2);
  function renameFiles_2() {
    let tExpectIdList = [];
    let tExpectList = [];
    let tExpectName = '';
    let tExpectYes = '';
    let tGotId = '';
    let tGotName = '';
    let tIsFolder = /\/$/;
    let tRow = 0;

    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    // Just get the top folders/files. Force test-tmp to small set of files.
    let tSetup = setupTestFolders({ obj: tRenObj, size: 'small', reset: true });

    menuGetList();
    menuRenameList();   //DIFF

    tExpectList = tRenObj.stl.getRange('C2:F6').getValues();   // row[0..4] col[0..3]
    tExpectIdList = tRenObj.stl.getRange('E2:E6').getFormulas(); // row[0..4] col[0] hyperlinks
    let tColMap = { CurrentName: 0, NewName: 1, Link: 2, Renamed: 3, Hyper: 0 };
    console.info(tExpectList);

    // for each row (0 to 4)
    for (tRow in tExpectList) {
      tGotId = tRenObj._hyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
      console.info('tGotId=' + tGotId);
      tExpectName = tExpectList[tRow][tColMap.NewName];
      console.info('tExpecName=' + tExpectName);
      if (tIsFolder.test(tExpectName))
        tGotName = DriveApp.getFolderById(tGotId).getName() + '/';
      else
        tGotName = DriveApp.getFileById(tGotId).getName();
      pUnit.assertEqual('Verify renamed file/folder.', tGotName, tExpectName, 'rfu2.1-row-' + tRow + 2); //DIFF
      tExpectYes = tExpectList[tRow][tColMap.Renamed];
      pUnit.assertEqual('', tExpectYes, 'yes', 'rfu2.2-row-' + tRow + 2); //DIFF
    }
  } // renameFiles_2
} // renameFilesUnit

/** ----------------------
 * @function Test UndoList
 */
function undoFilesUnit(pTest, pUnit) {
  // ------
  pTest.addTest(undoFiles_1);
  function undoFiles_1() {
    let tExpectIdList = [];
    let tExpectList = [];
    let tExpectName = '';
    let tExpectYes = '';
    let tGotId = '';
    let tGotName = '';
    let tIsFolder = /\/$/;
    let tRow = 0;

    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    // Just get the top folders/files. Force test-tmp to small set of files.
    let tSetup = setupTestFolders({ obj: tRenObj, size: 'small', reset: true });

    menuGetList();
    tRenObj.renameList(); //DIFF
    tRenObj.undoList();   //DIFF

    tExpectList = tRenObj.stl.getRange('C2:F6').getValues();   // row[0..4] col[0..3]
    tExpectIdList = tRenObj.stl.getRange('E2:E6').getFormulas(); // row[0..4] col[0] hyperlinks
    let tColMap = { CurrentName: 1, NewName: 0, Link: 2, Renamed: 3, Hyper: 0 };    //DIFF
    console.info(tExpectList);

    // for each row (0 to 4)
    for (tRow in tExpectList) {
      tGotId = tRenObj._hyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
      console.info('tGotId=' + tGotId);
      tExpectName = tExpectList[tRow][tColMap.NewName];
      console.info('tExpecName=' + tExpectName);
      if (tIsFolder.test(tExpectName))
        tGotName = DriveApp.getFolderById(tGotId).getName() + '/';
      else
        tGotName = DriveApp.getFileById(tGotId).getName();
      pUnit.assertEqual('Verify renamed file/folder.', tGotName, tExpectName, 'ufu1.1-row-' + tRow + 2);  //DIFF
      tExpectYes = tExpectList[tRow][tColMap.Renamed];
      pUnit.assertEqual('', tExpectYes, 'no', 'ufu1.2-row-' + tRow + 2);      //DIFF
    }
  } // undoFiles_1

  // ------
  pTest.addTest(undoFiles_2);
  function undoFiles_2() {
    let tExpectIdList = [];
    let tExpectList = [];
    let tExpectName = '';
    let tExpectYes = '';
    let tGotId = '';
    let tGotName = '';
    let tIsFolder = /\/$/;
    let tRow = 0;

    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    // Just get the top folders/files. Force test-tmp to small set of files.
    let tSetup = setupTestFolders({ obj: tRenObj, size: 'small', reset: true });

    menuGetList();
    menuRenameList(); //DIFF
    menuUndoList();   //DIFF

    tExpectList = tRenObj.stl.getRange('C2:F6').getValues();   // row[0..4] col[0..3]
    tExpectIdList = tRenObj.stl.getRange('E2:E6').getFormulas(); // row[0..4] col[0] hyperlinks
    let tColMap = { CurrentName: 1, NewName: 0, Link: 2, Renamed: 3, Hyper: 0 };    //DIFF
    console.info(tExpectList);

    // for each row (0 to 4)
    for (tRow in tExpectList) {
      tGotId = tRenObj._hyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
      console.info('tGotId=' + tGotId);
      tExpectName = tExpectList[tRow][tColMap.NewName];
      console.info('tExpecName=' + tExpectName);
      if (tIsFolder.test(tExpectName))
        tGotName = DriveApp.getFolderById(tGotId).getName() + '/';
      else
        tGotName = DriveApp.getFileById(tGotId).getName();
      pUnit.assertEqual('Verify renamed file/folder.', tGotName, tExpectName, 'ufu2.1-row-' + tRow + 2); //DIFF
      tExpectYes = tExpectList[tRow][tColMap.Renamed];
      pUnit.assertEqual('', tExpectYes, 'no', 'ufu2.2-row-' + tRow + 2); //DIFF
    }
  }
} // undoFilesUnit
