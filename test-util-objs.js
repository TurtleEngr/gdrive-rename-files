/**
 * $Source: /repo/public.cvs/app/gdrive-rename-files/github/test-util-objs.js,v $
 * @copyright $Date: 2021/03/11 02:46:04 $ UTC
 * @version $Revision: 1.3 $
 * @author TurtleEngr
 * @license https://www.gnu.org/licenses/gpl-3.0.txt
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
 * 
 *  runName()   - run the defined tests. No args, so that it can be called by a menu item. See RunTests class
 *  defName()   - define the unit test functions, and any setup/cleanup code. See RunTests class
 *  unitName()  - unit test functions in defName()
 *  assertName() - gsunit test asserts. See GsUnit class
 * 
 *  defName (and unitName in defName) can be callable in any order. Use menuName and runName functions to
 *  to select the desired tests.
 */
'use strict';

// ==============================================
// Define menus

/** ----------------------
 * @function This is called by the "top" onOpen menu function.
 * @param {obj} pUi - the ui handle for the SS
 * @param {obj} pMenu - the handle for the menu object
 */
function menuTestUtilObjs(pUi, pMenu) {
  pMenu = pMenu.addSeparator()
    .addSubMenu(pUi.createMenu('TestUtilObjs')
      .addItem('Clean Up', 'runCleanup')
      .addItem('Test Url2Id', 'runTestUrl2Id')
    );
  if (typeof menuGsUnitTest === 'function')
    pMenu = menuGsUnitTest(pUi, pMenu);
  return pMenu;
}

// ======================================
/* Run Unit Tests - Select the tests to be run.
 * (no args so they can be called by the UI menu)
 */

/** -------------------------------------------------------
 * @function Run the tests specified with the below functions.
 * @param {array} pTestFun - this will be one or more function names.
 */
function runTests(pTestFun = []) {
  console.time('runTests');
  var tUnit = new GsUnit({ name: 'base', debug: false });
  let tRun = new RunTests({ name: "TestUtilObjs", debug: false, gsunit: tUnit });
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

  console.timeEnd('runTests');
} // runTests

function runCleanup() {
} // runCleanup

function runAllTests() {
  runTests([defUnitUrl2Id, defUnitHyper2Id, defUnitReplaceSpecial, defUnitReplaceMany,
    defUnitSelectSheet, defUnitException, defUnitCreateFolderFiles, defUnitWalkFolderFiles]);
}

function runTestUrl2Id() {
  runTests([defUnitUrl2Id]);
}

function runTestHyper2Id() {
  runTests([defUnitHyper2Id]);
}

function runTestReplaceSpecial() {
  runTests([defUnitReplaceSpecial, defUnitReplaceMany]);
}

function runTestSelectSheet() {
  runTests([defUnitSelectSheet]);
}

function runTestException() {
  runTests([defUnitException]);
}

function runTestCreateFolderFiles() {
  runTests([defUnitCreateFolderFiles]);
}

function runTestGetFolderFiles() {
  runTests([defUnitWalkFolderFiles]);
}

// ==============================================
// Support functions for the Unit Tests


// ==============================================
// Define the Unit Tests

function defUnitUrl2Id(pTest, pUnit) {
  // ------
  pTest.addTest(unitUrl2IdStrict_pass);
  function unitUrl2IdStrict_pass() {
    let tUrl_1 = 'https://docs.google.com/spreadsheets/d/1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo/edit#gid=0';
    let tUrl_2 = 'https://docs.google.com/spreadsheets/d/1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';
    let tExpect = '1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';

    pUnit.assertEqual('Leave just Id part.', fUrl2IdStrict(tUrl_1), tExpect, 'u2isp-1');
    pUnit.assertEqual('Leave just Id part.', fUrl2IdStrict(tUrl_2), tExpect, 'u2isp-2');
    pUnit.assertEqual('Leave just Id part.', fUrl2IdStrict(tExpect), tExpect, 'u2isp-3');
  }

  // ------
  pTest.addTest(unitUrl2IdStrict_fail);
  function unitUrl2IdStrict_fail() {
    let e = pUnit.assertThrow('Expect a throw.', fUrl2IdStrict.bind(null, [3, 4]), 'u2isf-1.1');
    pUnit.assertTrue('', e instanceof SyntaxError, 'u2isf-1.2')
    pUnit.assertEqual('', e.message, 'Expected a string.', 'u2isf-1.3');
    pUnit.assertEqual('', e.name, 'SyntaxError', 'u2isf-1.4');

    e = pUnit.assertThrow('Expect a throw for empty.', fUrl2IdStrict.bind(null, 'https://'), 'u2isf-2.1');
    pUnit.assertTrue('', e instanceof Error, 'u2isf-2.2')
    pUnit.assertEqual('', e.message, 'Invalid Id. Empty', 'u2isf-2.3');

    let tShortId = '1p7YY3_t9RDwjVInORTRuDYzZP1'
    e = pUnit.assertThrow('Expect a throw for too short.', fUrl2IdStrict.bind(null, tShortId), 'u2isf-3.1');
    pUnit.assertTrue('', e instanceof Exception, 'u2isf-3.2')
    pUnit.assertEqual('', e.message, 'Invalid Id. Id should be 33 char long', 'u2isf-3.3');
    pUnit.assertEqual('', e.code, 'length-problem', 'u2isf-3.4');
    pUnit.assertEqual('', e.num, tShortId, 'u2isf-3.5');

    let tBadCh = 'xp7YY3_t9RDwjVInORTRuDYzZP1-J8mQo'
    e = pUnit.assertThrow('Expect a throw for bad ch.', fUrl2IdStrict.bind(null, tBadCh), 'u2isf-4.1');
    pUnit.assertTrue('', e instanceof Exception, 'u2isf-4.2')
    pUnit.assertEqual('', e.message, 'Invalid Id. Id should begin with 1', 'u2isf-4.3');
    pUnit.assertEqual('', e.code, 'prefix-problem', 'u2isf-4.4');
    pUnit.assertEqual('', e.num, tBadCh, 'u2isf-4.5');
  }

  // ------
  pTest.addTest(unitUrl2Id_pass);
  function unitUrl2Id_pass() {
    let tUrl_1 = 'https://docs.google.com/spreadsheets/d/1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo/edit#gid=0';
    let tUrl_2 = 'https://docs.google.com/spreadsheets/d/1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';
    let tExpect_1 = '1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';
    let tUrl_3 = 'https://docs.google.com/spreadsheets/d/3p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';
    let tUrl_4 = 'https://docs.google.com/spreadsheets/d/1p7YY3_t9RDwjVInORTRuDYzZP1';
    let tExpect_3 = '3p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';
    let tExpect_4 = '1p7YY3_t9RDwjVInORTRuDYzZP1';


    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tUrl_1), tExpect_1, 'u2ip-1');
    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tUrl_2), tExpect_1, 'u2ip-2');
    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tExpect_1), tExpect_1, 'u2ip-3');
    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tUrl_3), tExpect_3, 'u2ip-4');
    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tUrl_4), tExpect_4, 'u2ip-5');
  }

  // ------
  pTest.addTest(unitUrl2Id_fail);
  function unitUrl2Id_fail() {
    let e = pUnit.assertThrow('Expect a throw.', fUrl2Id.bind(null, [3, 4]), 'u2if-1.1');
    pUnit.assertTrue('', e instanceof SyntaxError, 'u2if-1.2')
    pUnit.assertEqual('', e.message, 'Expected a string.', 'u2if-1.3');
    pUnit.assertEqual('', e.name, 'SyntaxError', 'u2if-1.4');

    e = pUnit.assertThrow('Expect a throw for empty.', fUrl2Id.bind(null, 'https://'), 'u2if-2.1');
    pUnit.assertTrue('', e instanceof Error, 'u2if-2.2')
    pUnit.assertEqual('', e.message, 'Invalid Id. Empty', 'u2if-2.3');
  }
} // defUnitUrl2Id

function defUnitHyper2Id(pTest, pUnit) {
  // ------
  pTest.addTest(unitHyper2IdStrict_pass);
  function unitHyper2IdStrict_pass() {
    let tInput_1 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';
    let tInput_2 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "https://foo.bar Id fdgdf dfgdf dfgdf f/")';
    let tExpect = '1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN';

    pUnit.assertEqual('Leave just Id part.', fHyper2IdStrict(tInput_1), tExpect, 'h2isp-1');
    pUnit.assertEqual('Leave just Id part.', fHyper2IdStrict(tInput_2), tExpect, 'h2isp-2');
  }

  // ------
  pTest.addTest(unitHyper2IdStrict_fail);
  function unitHyper2IdStrict_fail() {
    let tInput_1 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';
    let tInput_2 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "https://foo.bar Id fdgdf dfgdf dfgdf f/")';
    let tInput_3 = '=HYPERLINK("https://drive.google.com/drive/folders/xjmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';

    let e = pUnit.assertThrow('Expect a throw.', fHyper2IdStrict.bind(null, [3, 4]), 'h2isf-1.1');
    pUnit.assertTrue('', e instanceof SyntaxError, 'h2isf-1.2')
    pUnit.assertEqual('', e.message, 'Expected a string.', 'h2isf-1.3');
    pUnit.assertEqual('', e.name, 'SyntaxError', 'h2isf-1.4');

    e = pUnit.assertThrow('Expect a throw for bad ch.', fHyper2IdStrict.bind(null, tInput_3), 'h2is-2.1');
    pUnit.assertTrue('', e instanceof Exception, 'h2isf-2.2')
    pUnit.assertEqual('', e.message, 'Invalid Id. Id should begin with 1', 'h2isf-3.3');
    pUnit.assertEqual('', e.code, 'prefix-problem', 'h2isf-3.4');
    pUnit.assertEqual('', e.num, 'xjmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN', 'h2isf-3.5');
  }

  // ------
  pTest.addTest(unitHyper2Id_pass);
  function unitHyper2Id_pass() {
    let tInput_1 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';
    let tInput_2 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "https://foo.bar Id fdgdf dfgdf dfgdf f/")';
    let tExpect_1 = '1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN';
    let tInput_3 = '=HYPERLINK("https://drive.google.com/drive/folders/xjmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';
    let tExpect_3 = 'xjmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN'

    pUnit.assertEqual('Leave just Id part.', fHyper2Id(tInput_1), tExpect_1, 'h2ip-1');
    pUnit.assertEqual('Leave just Id part.', fHyper2Id(tInput_2), tExpect_1, 'h2ip-2');
    pUnit.assertEqual('Leave just Id part.', fHyper2Id(tInput_3), tExpect_3, 'h2ip-3');
  }

  // ------
  pTest.addTest(unitHyper2Id_fail);
  function unitHyper2Id_fail() {
    let e = pUnit.assertThrow('Expect a throw.', fHyper2Id.bind(null, [3, 4]), 'h2if-1.1');
    pUnit.assertTrue('', e instanceof SyntaxError, 'h2if-1.2')
    pUnit.assertEqual('', e.message, 'Expected a string.', 'h2if-1.3');
    pUnit.assertEqual('', e.name, 'SyntaxError', 'h2if-1.4');
  }
}

/** ----------------------
 * @function Test the replaceSpecial method
 */
function defUnitReplaceSpecial(pTest, pUnit) {
  // ------
  pTest.addTest(unitReplaceSpecial);
  function unitReplaceSpecial() {
    let tIn;
    let tOut;

    tIn = 'a#A@@cde-fg.hi_jk';
    tOut = 'a_A_cde-fg.hi_jk';
    pUnit.assertEqual('replace non-alphanum', replaceSpecial(tIn), tOut, 'tr1.1');

    tIn = 'a#A@@cde-fg.hi_jk^l99!!8.foo';
    tOut = 'a_A_cde-fg.hi_jk_l99_8.foo';
    pUnit.assertEqual('replace non-alphanum', replaceSpecial(tIn), tOut, 'tr1.2');

    tIn = 'a\\b\'c\"d\(e\)f&g';
    tOut = 'a_b_c_d_e_f_g';
    pUnit.assertEqual('replace escaped char', replaceSpecial(tIn), tOut, 'tr1.3');

    tIn = 'a\\b\'c\"d!e@f#g$h%i^j&k*l(m)n_o+p-q=r[s]t{u}v|w;x:y,z.< >/?';
    tOut = 'a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p-q_r_s_t_u_v_w_x_y_z';
    //                a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p-q_r_s_t_u_v_w_x_y_z._
    pUnit.assertEqual('Check all special char', replaceSpecial(tIn), tOut, 'tr1.4');

    tIn = '@@a-foo)';
    tOut = 'a-foo';
    pUnit.assertEqual('Fix leading and trailing special char', replaceSpecial(tIn), tOut, 'tr1.5');

    tIn = '@@a - b also- / -(xxy).foo';
    tOut = 'a-b_also-xxy.foo';
    pUnit.assertEqual('Fix middle mess-1', replaceSpecial(tIn), tOut, 'tr1.6');

    tIn = '@@a - b a___l---s...o- / -(xxy).foo';
    tOut = 'a-b_a_l-s.o-xxy.foo';
    pUnit.assertEqual('Fix middle mess-2', replaceSpecial(tIn), tOut, 'tr1.7');

    tIn = 'a--_--b-_c_-d_-_-e';
    tOut = 'a-b-c_d-e';
    pUnit.assertEqual('More fix middle mess-3', replaceSpecial(tIn), tOut, 'tr1.8');
  }
} // defUnitReplaceSpecial


function defUnitReplaceMany(pTest, pUnit) {
  // ------
  pTest.addTest(unitReplaceMany);
  function unitReplaceMany() {
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
      //console.info(++i + " '" + tExpect + "':\n\t'" + tList[tExpect] + "',");
      pUnit.assertEqual('replace', replaceSpecial(tList[tExpect]), tExpect, 'trm.' + i);
    }
  }

  // ------
  pTest.addTest(unitReplaceManyTmp);
  function unitReplaceManyTmp() {
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
      //console.info(++i + " '" + replaceSpecial(tExpect) + "':\n\t'" + tExpect + "',");
      //console.info(++i + " '" + tExpect + "':\n\t'" + tExpectList[tExpect] + "',");
      pUnit.assertEqual('replace', replaceSpecial(tExpectList[tExpect]), tExpect, 'trmt-' + i);
    }
  }
} // defUnitReplaceMany

function defUnitSelectSheet(pTest, pUnit) {
  // ------
  pTest.addTest(unitSelectSheet_pass);
  function unitSelectSheet_pass() {
    let tName = 'newTestSheet';
    let tSS = SpreadsheetApp.getActiveSpreadsheet();

    let st = fSelectSheet(tSS, tName);
    pUnit.assertNotNull('Get a new sheet', st, 'ssp-1.1')
    pUnit.assertEqual('Check the Sheet name', st.getName(), tName, 'ssp-1.2');
    pUnit.assertNotNull('Select existing sheet', st, 'ssp-1.3')
    pUnit.assertEqual('Check the Sheet name', st.getName(), tName, 'ssp-1.4');
    tSS.deleteSheet(st);
  }

  // ------
  pTest.addTest(unitSelectSheet_fail);
  function unitSelectSheet_fail() {
    let tName = 'newTestSheet';

    let e = pUnit.assertThrow('No SS passed', fSelectSheet.bind(null, null, tName), 'ssf-1.1');
    pUnit.assertTrue('', e instanceof Exception, 'ssf-1.2')
    pUnit.assertEqual('', e.name, 'Exception', 'ssf-1.3');
    pUnit.assertEqual('', e.code, 'ss-error', 'ssf-1.4');
    pUnit.assertEqual('', e.message, 'There is no active SpreadSheet', 'ssf-1.5');

  }
} // defUnitSelectSheet

function defUnitException(pTest, pUnit) {
  // ------
  pTest.addTest(unitException_pass);
  function unitException_pass() {
    try {
      throw new Exception('Message Text', 'Code', 'Num')
    } catch (e) {
      pUnit.assertTrue('', e instanceof Exception, 'ep-1.1')
      pUnit.assertEqual('', e.name, 'Exception', 'ep-1.2');
      pUnit.assertEqual('', e.code, 'Code', 'ep-1.3');
      pUnit.assertEqual('', e.num, 'Num', 'ep-1.4');
      pUnit.assertEqual('', e.message, 'Message Text', 'ep-1.5');
      pUnit.assertEqual('', e.toString(), 'Exception: Message Text (Code)[Num]', 'ep-1.6');
    }

    try {
      throw new Exception('Message Text', '', 'Num')
    } catch (e) {
      pUnit.assertTrue('', e instanceof Exception, 'ep-2.1')
      pUnit.assertEqual('', e.name, 'Exception', 'ep-2.2');
      pUnit.assertEqual('', e.code, '', 'ep-2.3');
      pUnit.assertEqual('', e.num, 'Num', 'ep-2.4');
      pUnit.assertEqual('', e.toString(), 'Exception: Message Text [Num]', 'ep-2.5');
    }

    try {
      throw new Exception('Message Text', 'Code', '')
    } catch (e) {
      pUnit.assertTrue('', e instanceof Exception, 'ep-3.1')
      pUnit.assertEqual('', e.name, 'Exception', 'ep-3.2');
      pUnit.assertEqual('', e.code, 'Code', 'ep-3.3');
      pUnit.assertEqual('', e.num, '', 'ep-3.4');
      pUnit.assertEqual('', e.toString(), 'Exception: Message Text (Code)', 'ep-3.5');
    }

  }
}

function defUnitCreateFolderFiles(pTest, pUnit) {
  function getListOfNames(pHandleList) {
    let tList = '';
    for (let tHandle of pHandleList)
      tList += tHandle.getName() + ',';
    return tList;
  }

  // ------
  pTest.addTest(unitCreateFolderFile_pass);
  function unitCreateFolderFile_pass() {
    let tName = 'tmp-folders';
    let tTop = new CreateFolderFiles({ name: tName, size: 'simple', debug: true });
    if (tTop.exists)
      tTop.delTestFolder();

    pUnit.assertFalse('Check not exist.', tTop.exists, 'cffp-1');

    tTop.addTestFolder();
    pUnit.assertTrue('Check exist.', tTop.exists, 'cffp-2.1');
    pUnit.assertEqual('Check top folder name.', tTop.testFolder.getName(), tName, 'cffp-2.2');
    pUnit.assertEqual('Check count.', tTop.list.length, 9, 'cffp-2.3');

    let tNameList = getListOfNames(tTop.list);
    pUnit.assertEqual('Check names.', tNameList, 'folder1,file1,folder2,file2,file3,folder3,folder4,folder5,file4,', 'cffp-3');

    tTop.delTestFolder();
  }

  // ------
  pTest.addTest(unitCreateFolderFile_pass2);
  function unitCreateFolderFile_pass2() {
    let tName = 'tmp-custom';
    let tMap = [
      { type: 'file', name: '1-file1', parent: 'tmp-custom' },
      [
        { type: 'folder', name: '2-folder1', parent: 'tmp-custom' },
        { type: 'file', name: '2-file2', parent: '2-folder1' },
        [
          { type: 'folder', name: '3-folder2', parent: '2-folder1' },
          { type: 'file', name: '3-file3', parent: '3-folder2' },
        ],
        { type: 'file', name: '2-file4', parent: '2-folder1' },
      ],
    ];

    let tTop = new CreateFolderFiles({ name: tName, custom: tMap, debug: true })
    if (tTop.exists)
      tTop.delTestFolder();

    pUnit.assertEqual('Check size.', tTop.size, 'custom', 'cffp2-1');

    tTop.addTestFolder();
    let tNameList = getListOfNames(tTop.list);
    pUnit.assertEqual('Check names.', tNameList, '1-file1,2-folder1,2-file2,3-folder2,3-file3,2-file4,', 'cffp2-2');

    tTop.delTestFolder();
  }

  // ------
  pTest.addTest(unitCreateFolderFile_fail);
  function unitCreateFolderFile_fail() {
    let tName = 'tmp-custom';
    let tMap = [
      { type: 'file', name: '1-file1', parent: 'tmp-custom' },
      [
        { type: 'folder', name: '2-folder1', parent: 'tmp-custom' },
        { type: 'file', name: '2-file2', parent: 'xxx2-folder1xxx' },
        [
          { type: 'folder', name: '3-folder2', parent: '2-folder1' },
          { type: 'file', name: '3-file3', parent: '3-folder2' },
        ],
        { type: 'file', name: '2-file4', parent: '2-folder1' },
      ],
    ];

    let tTop = new CreateFolderFiles({ name: tName, custom: tMap, debug: true })
    if (tTop.exists)
      tTop.delTestFolder();

    let e = pUnit.assertThrow('Expect bad parent error', tTop.addTestFolder, 'cfff-1.1');
    pUnit.assertEqual('Check return error', e.message, 'Bad structure. Expected: "2-folder1"', 'cfff-1.2');
    tTop.delTestFolder();
  }
}

class TestGetList {
  constructor() {
    this.list = [];
  }

  reset() {
    this.list = [];
  }

  processFile(pArg = { element: null, level: 0 }) {
    if (pArg.element == null)
      throw new SyntaxError('Missing file handle.');
    if (pArg.level <= 0)
      throw new SyntaxError('Invalid level: ' + pArg.level);
    let tRow = [
      pArg.level,
      pArg.element.getParents().next().getName() + '/',
      pArg.element.getName(),
    ];
    this.list.push(tRow);
  }

  processFolder(pArg = { element: null, level: 0 }) {
    if (pArg.element == null)
      throw new SyntaxError('Missing folder handle.');
    if (pArg.level <= 0)
      throw new SyntaxError('Invalid level: ' + pArg.level);
    let tRow = [
      pArg.level,
      pArg.element.getParents().next().getName() + '/',
      pArg.element.getName() + '/',
    ];
    this.list.push(tRow);
  }
} // TestGetList

function defUnitWalkFolderFiles(pTest, pUnit) {
  // ------
  pTest.addTest(unitWalkFolderFiles_pass1);
  function unitWalkFolderFiles_pass1() {
    let tDebug = false;
    let tName = 'tmp-folders';
    let tTestStruct = new CreateFolderFiles({ name: tName, size: 'simple', debug: tDebug });
    if (tTestStruct.exists && !tDebug)
      tTestStruct.delTestFolder()
    tTestStruct.addTestFolder();
    let tTop = tTestStruct.testFolder;
    pUnit.assertEqual('topFolder is set.', tTop.getName(), tName, 'wffp1-1')

    let tGetList = new TestGetList();
    pUnit.assertTrue('GetList.processFile is defined.', typeof tGetList.processFile == 'function', 'wffp1-2.1');
    pUnit.assertTrue('GetList.processFolder is defined.', typeof tGetList.processFolder == 'function', 'wffp1-2.2');

    let tGetFolderFiles = new WalkFolderFiles({ topFolder: tTop, collectObj: tGetList });
    pUnit.assertNotNull('Create WalkFolderFiles obj.', tGetFolderFiles, 'wffp1-3.1');
    pUnit.assertEqual('maxLevel is set.', tGetFolderFiles.maxLevel, 1, 'wffp1-3.2')
    pUnit.assertEqual('incFiles is set.', tGetFolderFiles.incFiles, true, 'wffp1-3.3')
    pUnit.assertEqual('debug is set.', tGetFolderFiles.debug, false, 'wffp1-3.4')
    pUnit.assertEqual('collectObj is set.', tGetFolderFiles.collectObj, tGetList, 'wffp1-3.5')
    pUnit.assertEqual('topFolder is set.', tGetFolderFiles.topFolder, tTop, 'wffp1-3.6')

    tGetFolderFiles.incFiles = false;
    tGetFolderFiles.start();
    if (tDebug) console.info(tGetList.list);
    pUnit.assertEqual('Expected first folder', tGetList.list[0][2], 'folder3/', 'wffp1-4.1');
    pUnit.assertEqual('Expected first folder', tGetList.list[1][2], 'folder1/', 'wffp1-4.2');

    tGetList.reset();
    pUnit.assertEqual('Expect empty list', tGetList.list.length, 0, 'wffp1-5');
    tGetFolderFiles.incFiles = true;
    tGetFolderFiles.start();
    if (tDebug) console.info(tGetList.list);
    pUnit.assertEqual('Expected first file', tGetList.list[0][2], 'file4', 'wffp1-6');

    tGetFolderFiles.maxLevel = 10;
    tGetFolderFiles.incFiles = true;
    tGetList.reset();
    tGetFolderFiles.start();
    if (tDebug) console.info(tGetList.list);
    /* Expect:
      [ [ 1, 'tmp-folders/', 'file4' ],
      [ 1, 'tmp-folders/', 'folder3/' ],
      [ 2, 'folder3/', 'folder4/' ],
      [ 3, 'folder4/', 'folder5/' ],
      [ 1, 'tmp-folders/', 'folder1/' ],
      [ 2, 'folder1/', 'file3' ],
      [ 2, 'folder1/', 'file1' ],
      [ 2, 'folder1/', 'folder2/' ],
      [ 3, 'folder2/', 'file2' ] ]
    */
    pUnit.assertEqual('', tGetList.list[0][0], 1, 'wffp2-7.1');
    pUnit.assertEqual('', tGetList.list[0][2], 'file4', 'wffp2-7.2');

    pUnit.assertEqual('', tGetList.list[1][0], 1, 'wffp2-7.3');
    pUnit.assertEqual('', tGetList.list[1][2], 'folder3/', 'wffp2-7.4');

    pUnit.assertEqual('', tGetList.list[2][0], 2, 'wffp2-7.5');
    pUnit.assertEqual('', tGetList.list[2][2], 'folder4/', 'wffp2-7.6');

    pUnit.assertEqual('', tGetList.list[3][0], 3, 'wffp2-7.7');
    pUnit.assertEqual('', tGetList.list[3][2], 'folder5/', 'wffp2-7.8');

    pUnit.assertEqual('', tGetList.list[4][0], 1, 'wffp2-7.9');
    pUnit.assertEqual('', tGetList.list[4][2], 'folder1/', 'wffp2-7.10');

    pUnit.assertEqual('', tGetList.list[5][0], 2, 'wffp2-7.11');
    pUnit.assertEqual('', tGetList.list[5][2], 'file3', 'wffp2-7.12');

    pUnit.assertEqual('', tGetList.list[6][0], 2, 'wffp2-7.13');
    pUnit.assertEqual('', tGetList.list[6][2], 'file1', 'wffp2-7.14');

    pUnit.assertEqual('', tGetList.list[7][0], 2, 'wffp2-7.15');
    pUnit.assertEqual('', tGetList.list[7][2], 'folder2/', 'wffp2-7.16');

    pUnit.assertEqual('', tGetList.list[8][0], 3, 'wffp2-7.17');
    pUnit.assertEqual('', tGetList.list[8][2], 'file2', 'wffp2-7.18');

    if (tTestStruct.exists && !tDebug)
      tTestStruct.delTestFolder()
  }
}
