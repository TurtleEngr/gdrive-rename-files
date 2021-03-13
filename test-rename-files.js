/**
 * $Source: /repo/public.cvs/app/gdrive-rename-files/github/test-rename-files.js,v $
 * @copyright $Date: 2021/03/13 17:44:26 $ UTC
 * @version $Revision: 1.9 $
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
      .addItem('Clean Up Replace Tests', 'runReplaceCleanup')
      .addItem('Run All non-UI Rename Tests', 'runAllNonUiReplaceTests')
      .addItem('Run All UI Rename Tests', 'runAllUiReplaceTests')
      .addItem('Make Class', 'runMakeClass')
      .addItem('Check Config', 'runCheckConfig')
      .addItem('Get Files Test', 'runGetFilesTest')
      .addItem('Get Files UI', 'runGetFilesUi')
      .addItem('Rename Files Test', 'runRenameFiles')
      .addItem('Undo Files Test', 'runUndoFiles')
    );
  return pMenu;
}

// ======================================
/* Run Unit Tests - Select the tests to be run.
 * (no args so they can be called by the UI menu)
 */

/** ----------------------
 * @function Cleanup after all tests.
 */
function runReplaceCleanup() {
  let testF = new CreateFolderFiles();
  testF.delTestFolder();
} // runReplaceCleanup

/** ----------------------
 * @function Run all non-UI unit tests. List them in the array passed to runTests.
 */
function runAllNonUiReplaceTests() {
  let tSetup = new CreateFolderFiles();
  if (tSetup.exists)
    tSetup.delTestFolder();
  runRenameTests([defUnitMakeClass, defUnitGetFiles,
    defUnitGetFiles2])
}

/** ----------------------
 * @function Run all UI unit tests. List them in the array passed to runTests.
 */
function runAllUiReplaceTests() {
  let tSetup = new CreateFolderFiles();
  if (tSetup.exists)
    tSetup.delTestFolder();
  runRenameTests([defUnitCheckConfig, defUnitGetFilesUi, defUnitRenameFiles, defUnitUndoFiles])
}

/** ----------------------
 * @function Verify the RenameFiles class is created OK.
 */
function runMakeClass() {
  runRenameTests([defUnitMakeClass]);
}

/** ----------------------
 * @function Verify the getConfig is working for all pass/fail checks
 */
function runCheckConfig() {
  runRenameTests([defUnitCheckConfig]);
}

/** ----------------------
 * @function Verify GetFiles is functional.
 */
function runGetFilesTest() {
  runRenameTests([defUnitGetFiles, defUnitGetFiles2]);
}

/** ----------------------
 * @function Verify the GetFiles UI is working.
 */
function runGetFilesUi() {
  runRenameTests([defUnitGetFilesUi]);
}

/** ----------------------
 * @function Verify RenameList is functional.
 */
function runRenameFiles() {
  runRenameTests([defUnitRenameFiles]);
}

/** ----------------------
 * @function Verfify UndoList is functional.
 */
function runUndoFiles() {
  runRenameTests([defUnitUndoFiles]);
}

/** -------------------------------------------------------
 * @function Run the tests specified with the above functions.
 * @param {array} pTestFun - this will be one or more function names.
 */
function runRenameTests(pTestFun = []) {
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
  let pSize = fDefault(pArg.size, 'large');  // Dir struct size
  let pResetUp = fDefault(pArg.reset, false);
  let tSetup = new CreateFolderFiles({ size: pSize });
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
function defUnitMakeClass(pTest, pUnit) {
  // ------
  pTest.addTest(testRenameClass);
  function testRenameClass() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });

    pUnit.assertEqual('Create class. Get name.', tRenObj.sheetLog, 'RenameList', 'mcu1');

    fSelectSheet(tRenObj.ss, 'RenameList');
    pUnit.assertEqual('RenameList is active.', tRenObj.ss.getActiveSheet().getName(), tRenObj.sheetLog, 'mcu2');

    fSelectSheet(tRenObj.ss, 'Interface');
    pUnit.assertEqual('Interface is active.', tRenObj.ss.getActiveSheet().getName(), tRenObj.sheetUI, 'mcu3');

    tRenObj.stl.activate();
    pUnit.assertEqual('RenameList is active.', tRenObj.ss.getActiveSheet().getName(), 'RenameList', 'mcu4');
  }
} // makeClassUnit

/** ----------------------
 * @function Test getConfig
 */
function defUnitCheckConfig(pTest, pUnit) {
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
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true, debug: true });
    // Set to false so you can watch the UI change on Interface sheet
    //pTest.showPass = false;
    //pTest.showResults = false;
    let tSetup = new CreateFolderFiles();

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
function defUnitGetFiles(pTest, pUnit) {
  // ------
  pTest.addTest(testGetFiles);
  function testGetFiles() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });
    
    tRenObj.levelLimit = 2;
    tRenObj.getFiles = false;
    tRenObj.getFolderList();
    let tRange2 = tRenObj.list;
    console.info(tRange2);
    let tExpect = "1,test-tmp/,L1 Two/,L1_Two/,2,L1 Two/,L2@,weird& - name//,L2_weird-name/,2,L1 Two/,L2  (name)/,L2_name/,1,test-tmp/,L1 three/,L1_three/,2,L1 three/,L2@,weird& - name//,L2_weird-name/,2,L1 three/,L2  (na+me)x/,L2_na_me_x/,1,test-tmp/,L1 One/,L1_One/,2,L1 One/,L2@,weird& - name//,L2_weird-name/,2,L1 One/,L2-OK-Folder/,L2-OK-Folder/,2,L1 One/,L2  (name)/,L2_name/";
    let regEx = /,=HYPERLINK\([^)]*\)/g
    let tGot = tRange2.toString().replace(regEx, '');
    pUnit.assertEqual('getFolders Output', tGot, tExpect, 'tgf3.1');

    tRenObj.levelLimit = 2;
    tRenObj.getFiles = false;
    tRenObj.onlyShowDiff = true;
    tRenObj.getFolderList();
    tRange2 = tRenObj.list;
    console.info(tRange2);
    tExpect = "1,test-tmp/,L1 Two/,L1_Two/,2,L1 Two/,L2@,weird& - name//,L2_weird-name/,2,L1 Two/,L2  (name)/,L2_name/,1,test-tmp/,L1 three/,L1_three/,2,L1 three/,L2@,weird& - name//,L2_weird-name/,2,L1 three/,L2  (na+me)x/,L2_na_me_x/,1,test-tmp/,L1 One/,L1_One/,2,L1 One/,L2@,weird& - name//,L2_weird-name/,2,L1 One/,L2  (name)/,L2_name/";
    regEx = /,=HYPERLINK\([^)]*\)/g
    tGot = tRange2.toString().replace(regEx, '');
    pUnit.assertEqual('getFolders Output', tGot, tExpect, 'tgf3.2');

    tRenObj.levelLimit = 1;
    tRenObj.getFiles = true;
    tRenObj.getFolders = true;
    tRenObj.rename = true;
    tRenObj.onlyShowDiff = false;
    tRenObj.getFolderList();
    tRange2 = tRenObj.list;
    tGot = tRange2.toString().replace(regEx = /,=HYPERLINK\([^)]*\)/g, '');
    //if (pTest.debug) console.info(tRange2);
    pUnit.assertStrContains('Get folders and files.', tGot, 'test-tmp/', 'tgf4.1');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_One/', 'tgf4.2');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_Two/', 'tgf4.3');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_three/', 'tgf4.4');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_bar', 'tgf4.5');
    pUnit.assertStrContains('Get folders and files.', tGot, 'L1_foo', 'tgf4.6');

    pUnit.assertStrNotContains('Get folders and files.', tGot, 'FYE_d.L2_dg', 'tgf4.7');
    pUnit.assertStrNotContains('Get folders and files.', tGot, 'L2_H_DF_DE', 'tgf4.8');
    pUnit.assertStrNotContains('Get folders and files.', tGot, 'L2_T_UG.we', 'tgf4.9');
    pUnit.assertStrNotContains('Get folders and files.', tGot, 'L2_a_lkj_569_l_j', 'tgf4.10');

    tSetup.delTestFolder();
  } // testGetFiles

  // ------
  pTest.addTest(testGetRecurse1);
  function testGetRecurse1() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });

    tRenObj.levelLimit = 10;
    tRenObj.getFiles = true;
    tRenObj.getFolders = true;
    tRenObj.rename = true;
    tRenObj.onlyShowDiff = false;
    tRenObj.getFolderList();
    let tRange1 = tRenObj.list;
    let regEx = /,=HYPERLINK\([^)]*\)/g
    let tGot = tRange1.toString().replace(regEx, '');
    console.info('Got: ' + tGot);
    let tExpectList = [
      'FYE_d.L2_dg',
      'L1_bar',
      'L1_foo',
      'L1_One/',
      'L1_three/',
      'L1_Two/',
      'L2_a_lkj_569_l_j',
      'L2_a_lkj_569_l_jx',
      'L2_H_DF_DE',
      'L2_name/',
      'L2_na_me_x/',
      'L2-OK-File',
      'L2-OK-Folder/',
      'L2_T_UG.we',
      'L2_weird-name/',
      'L2_x_T_UG.we',
      'L3h_lf_jsi.foo/',
      'L3h_lf_jsi.foox/',
      'L3-OK-File',
      'L3_OK-File.name.txt',
      'L3_sfasda_Fuf_gnSDF_HRTH_T',
      'L3_sfasda_FufgnSDF_HR_TH_T',
      'L3_sfasda_FufgnSDF_HRT_H_T',
      'L3_sfasda_FufgnSDF_HRTH_T',
      'L4_sjkl46j_JH_H',
      'L4_sjkl46j_JH_H/',
      'lf_jsL3i.foo/',
    ]
    for (let i in tExpectList) {
      pTest.debugMsg('tgr1 check: ' + i + ': ' + tExpectList[i]);
      pUnit.assertStrContains('Check for renamed file or folder.', tGot, tExpectList[i], 'tgr1');
    }
    tSetup.delTestFolder();
  } // testGetRecurse1

  // ------
  pTest.addTest(testGetRecurse2);
  function testGetRecurse2() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });

    tRenObj.levelLimit = 10;
    tRenObj.getFiles = false;
    tRenObj.getFolders = true;
    tRenObj.rename = true;
    tRenObj.onlyShowDiff = true;
    tRenObj.getFolderList();
    let tRegEx = /\/$/;
    for (let i in tRenObj.list) {
      pTest.debugMsg('tgr2 check: "' + tRenObj.list[i][2] + '" "' + tRenObj.list[i][3] + '"');
      pUnit.assertNotEqual('Only get Diff.', tRenObj.list[i][2], tRenObj.list[i][3], 'tgr2.1.' + i)
      pUnit.assertTrue('Only get folders.', tRegEx.test(tRenObj.list[i][3]), 'tgr2.2.' + i);
    }
    tSetup.delTestFolder();
  } // testGetRecurse2
} // getFilesUnit

/** ----------------------
 * @function Test getFile functionality.
 */
function defUnitGetFiles2(pTest, pUnit) {
  // ------
  pTest.addTest(testGetSomeFiles);
  function testGetSomeFiles() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj, size: 'small', reset: true });

    tRenObj.list = [];
    tRenObj.levelLimit = 10;
    tRenObj.getFiles = true;
    tRenObj.getFolders = true;
    tRenObj.rename = true;
    tRenObj.onlyShowDiff = true;
    tRenObj.getFolderList();
    let tRange = tRenObj.list;
    console.info(tRange);
    let tExpect = "1,test-tmp/,L1:foo,L1_foo,1,test-tmp/,L1^bar,L1_bar,1,test-tmp/,L1 Two/,L1_Two/,2,L1 Two/,L2 file with lots of spaces,L2_file_with_lots_of_spaces,2,L1 Two/,%*FYE $d ..L2 dg,FYE_d.L2_dg,1,test-tmp/,L1 three/,L1_three/,2,L1_this_folder-is-OK/,L2 uyi dg,L2_uyi_dg,2,L1_this_folder-is-OK/,L3h(lf)%jsi.foox /,L3h_lf_jsi.foox/,3,L3h(lf)%jsi.foox /,L4 sjkl46j*^JH^H(,L4_sjkl46j_JH_H,1,test-tmp/,L1 One/,L1_One/";
    let tRemoveHyperLink = /,=HYPERLINK\([^)]*\)/g;
    let tGot = tRange.toString().replace(tRemoveHyperLink, '');
    pUnit.assertEqual('getFiles Output', tGot, tExpect, 'tgsf1');
    tSetup.delTestFolder();
  } // testGetSomeFiles
} // getFilesUnit2

/** ----------------------
 * @function Test getFiles from a UI perspective.
 */
function defUnitGetFilesUi(pTest, pUnit) {
  // ------
  pTest.addTest(getFilesUi_1);
  function getFilesUi_1() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });
    setUiFields(tRenObj, { levelLimit: 2 });
    setUiFields(tRenObj, { onlyShowDiff: 'no' });

    menuGetList();

    tRenObj.stu.activate();
    let tRange = tRenObj.stl.getRange('A1:E27').setBackground('white');
    let tValues = tRange.getValues();
    let tValuesFlat = tValues.flat(1);
    //console.info(tValues);
    //console.info(tValuesFlat);
  
    let tExpect = [
      [ 'Level', 'ParentFolder', 'CurrentName', 'NewName', 'Link' ],
      [ 1, 'test-tmp/', 'L1^bar', 'L1_bar', 'Id' ],
      [ 1, 'test-tmp/', 'L1:foo', 'L1_foo', 'Id' ],
      [ 1, 'test-tmp/', 'L1 One/', 'L1_One/', 'Id' ],
      [ 1, 'test-tmp/', 'L1 three/', 'L1_three/', 'Id' ],
      [ 1, 'test-tmp/', 'L1 Two/', 'L1_Two/', 'Id' ],
      [ 2, 'L1 One/', '%*FYE $d ..L2 dg', 'FYE_d.L2_dg', 'Id' ],
      [ 2, 'L1 One/', '-L2 a"lkj"569}{l/</jx ', 'L2_a_lkj_569_l_jx', 'Id' ],
      [ 2, 'L1 One/', 'L2 @#$%$^H\'DF\'DE$%^', 'L2_H_DF_DE', 'Id' ],
      [ 2, 'L1 One/', 'L2  (name)/', 'L2_name/', 'Id' ],
      [ 2, 'L1 One/', 'L2 @#,$T%UG&.we/', 'L2_T_UG.we', 'Id' ],
      [ 2, 'L1 One/', 'L2@,weird& - name//', 'L2_weird-name/', 'Id' ],
      [ 2, 'L1 One/', 'L2-OK-File', 'L2-OK-File', 'Id' ],
      [ 2, 'L1 One/', 'L2-OK-Folder/', 'L2-OK-Folder/', 'Id' ],
      [ 2, 'L1 three/', '%*FYE $d ..L2 dg', 'FYE_d.L2_dg', 'Id' ],
      [ 2, 'L1 three/', '-L2 a"lkj"569}{l/</j', 'L2_a_lkj_569_l_j', 'Id' ],
      [ 2, 'L1 three/', 'L2 @#$%$^H\'DF\'DE$%^', 'L2_H_DF_DE', 'Id' ],
      [ 2, 'L1 three/', 'L2  (na+me)x/', 'L2_na_me_x/', 'Id' ],
      [ 2, 'L1 three/', 'L2@,weird& - name//', 'L2_weird-name/', 'Id' ],
      [ 2, 'L1 three/', 'L2  x @#,$T%UG&.we', 'L2_x_T_UG.we', 'Id' ],
      [ 2, 'L1 Two/', '%*FYE $d ..L2 dg', 'FYE_d.L2_dg', 'Id' ],
      [ 2, 'L1 Two/', '-L2 a"lkj"569}{l/</j', 'L2_a_lkj_569_l_j', 'Id' ],
      [ 2, 'L1 Two/', 'L2 @#$%$^H\'DF\'DE$%^', 'L2_H_DF_DE', 'Id' ],
      [ 2, 'L1 Two/', 'L2  (name)/', 'L2_name/', 'Id' ],
      [ 2, 'L1 Two/', 'L2 @#,$T%UG&.we', 'L2_T_UG.we', 'Id' ],
      [ 2, 'L1 Two/', 'L2@,weird& - name//', 'L2_weird-name/', 'Id' ],
      [ '', '', '', '', '' ],
    ];
    let tExpectFlat = tExpect.flat(1);
    //console.info(tExpectFlat);
    let tEl = '';
    for (let i in tExpectFlat) {
      tEl = tExpectFlat[i].toString();
      //console.info(i + ' "' + tEl + '"');
      //Defect: values with "'" in them do not work in the assert! Blanks also won't work.
      if (tEl == '' || tEl.includes("'"))
        continue;
      pUnit.assertArrayContains('Check default Ui get files list.', tValuesFlat, tEl, 'gfu1-1.'+i);
    }
    pUnit.assertStrContains('OK names found.',tValuesFlat.toString(), 'OK', 'gfu1-2');
    tSetup.delTestFolder();
  } // getFilesUi_1

  // ------
  pTest.addTest(getFilesUi_2);
  function getFilesUi_2() {
    let tRenObj = new RenameFiles({ logName: 'RenameList', test: true });
    let tSetup = setupTestFolders({ obj: tRenObj });
    setUiFields(tRenObj, { levelLimit: 2 });
    setUiFields(tRenObj, { onlyShowDiff: 'yes' });

    menuGetList();

    tRenObj.stu.activate();
    let tRange = tRenObj.stl.getRange('A1:E26').setBackground('white');
    let tValues = tRange.getValues();
    let tValuesFlat = tValues.flat(1);
    //console.info(tValues);

    let tExpect = [
      [ 'Level', 'ParentFolder', 'CurrentName', 'NewName', 'Link' ],
      [ 1, 'test-tmp/', 'L1^bar', 'L1_bar', 'Id' ],
      [ 1, 'test-tmp/', 'L1:foo', 'L1_foo', 'Id' ],
      [ 1, 'test-tmp/', 'L1 One/', 'L1_One/', 'Id' ],
      [ 1, 'test-tmp/', 'L1 three/', 'L1_three/', 'Id' ],
      [ 1, 'test-tmp/', 'L1 Two/', 'L1_Two/', 'Id' ],
      [ 2, 'L1 One/', '%*FYE $d ..L2 dg', 'FYE_d.L2_dg', 'Id' ],
      [ 2, 'L1 One/', '-L2 a"lkj"569}{l/</jx ', 'L2_a_lkj_569_l_jx', 'Id' ],
      [ 2, 'L1 One/', 'L2 @#$%$^H\'DF\'DE$%^', 'L2_H_DF_DE', 'Id' ],
      [ 2, 'L1 One/', 'L2  (name)/', 'L2_name/', 'Id' ],
      [ 2, 'L1 One/', 'L2 @#,$T%UG&.we/', 'L2_T_UG.we', 'Id' ],
      [ 2, 'L1 One/', 'L2@,weird& - name//', 'L2_weird-name/', 'Id' ],
      [ 2, 'L1 three/', '%*FYE $d ..L2 dg', 'FYE_d.L2_dg', 'Id' ],
      [ 2, 'L1 three/', '-L2 a"lkj"569}{l/</j', 'L2_a_lkj_569_l_j', 'Id' ],
      [ 2, 'L1 three/', 'L2 @#$%$^H\'DF\'DE$%^', 'L2_H_DF_DE', 'Id' ],
      [ 2, 'L1 three/', 'L2  (na+me)x/', 'L2_na_me_x/', 'Id' ],
      [ 2, 'L1 three/', 'L2@,weird& - name//', 'L2_weird-name/', 'Id' ],
      [ 2, 'L1 three/', 'L2  x @#,$T%UG&.we', 'L2_x_T_UG.we', 'Id' ],
      [ 2, 'L1 Two/', '%*FYE $d ..L2 dg', 'FYE_d.L2_dg', 'Id' ],
      [ 2, 'L1 Two/', '-L2 a"lkj"569}{l/</j', 'L2_a_lkj_569_l_j', 'Id' ],
      [ 2, 'L1 Two/', 'L2 @#$%$^H\'DF\'DE$%^', 'L2_H_DF_DE', 'Id' ],
      [ 2, 'L1 Two/', 'L2  (name)/', 'L2_name/', 'Id' ],
      [ 2, 'L1 Two/', 'L2 @#,$T%UG&.we', 'L2_T_UG.we', 'Id' ],
      [ 2, 'L1 Two/', 'L2@,weird& - name//', 'L2_weird-name/', 'Id' ],
      [ '', '', '', '', '' ],
      [ '', '', '', '', '' ],
    ];
    let tExpectFlat = tExpect.flat(1);
    let tEl = '';
    for (let i in tExpectFlat) {
      tEl = tExpectFlat[i].toString();
      //console.info(i + ' "' + tEl + '"');
      //Defect: values with "'" in them do not work in the assert! Blanks also won't work.
      if (tEl == '' || tEl.includes("'"))
        continue;
      pUnit.assertArrayContains('Check default Ui get files list.', tValuesFlat, tEl, 'gfu2-1.'+i);
    }
    pUnit.assertStrNotContains('No OK names found.',tValuesFlat.toString(), 'OK', 'gfu2-2');
    tSetup.delTestFolder();
  } // getFilesUi_2
} // getFilesUiUnit

/** ----------------------
 * @function Test RenameList
 */
function defUnitRenameFiles(pTest, pUnit) {
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
      tGotId = fHyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
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
    pUnit.assertEqual('Should find no files.', tRenObj.error.code, 'empty-list', 'rf1');
    tSetup.delTestFolder();
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
    let tSetup = setupTestFolders({ obj: tRenObj, size: 'medium', reset: true });
    setUiFields(tRenObj, { levelLimit: 10 });
    setUiFields(tRenObj, { onlyShowDiff: 'yes' });

    menuGetList();
    menuRenameList();   //DIFF

    tExpectList = tRenObj.stl.getRange('C2:F18').getValues();   // row[0..4] col[0..3]
    tExpectIdList = tRenObj.stl.getRange('E2:E18').getFormulas(); // row[0..4] col[0] hyperlinks
    let tColMap = { CurrentName: 0, NewName: 1, Link: 2, Renamed: 3, Hyper: 0 };
    console.info(tExpectList);

    // for each row (0 to 4)
    for (tRow in tExpectList) {
      tGotId = fHyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
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
    tSetup.delTestFolder();
  } // renameFiles_2
} // renameFilesUnit

/** ----------------------
 * @function Test UndoList
 */
function defUnitUndoFiles(pTest, pUnit) {
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
      tGotId = fHyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
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
    tSetup.delTestFolder();
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
      tGotId = fHyper2Id(tExpectIdList[tRow][tColMap.Hyper]);
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
    tSetup.delTestFolder();
  }
} // undoFilesUnit
