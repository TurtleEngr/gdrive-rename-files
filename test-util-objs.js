/**
 * $Source: /repo/public.cvs/app/gdrive-rename-files/github/test-util-objs.js,v $
 * @copyright $Date: 2021/03/04 09:15:07 $ UTC
 * @version $Revision: 1.1 $
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
  let tSetup = new TestSetup();
  runTests([defUnitUrl2Id, defUnitHyper2Id, defUnitReplaceSpecial, defUnitReplaceMany])
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

// ==============================================
// Support functions for the Unit Tests


// ==============================================
// Define the Unit Tests

function defUnitUrl2Id(pTest, pUnit) {
  // ------
  pTest.addTest(unitUrl2Id_pass);
  function unitUrl2Id_pass() {
    let tUrl_1 = 'https://docs.google.com/spreadsheets/d/1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo/edit#gid=0';
    let tUrl_2 = 'https://docs.google.com/spreadsheets/d/1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';
    let tExpect = '1p7YY3_t9RDwjVInORTRuDYzZP1-J8mQo';

    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tUrl_1), tExpect, 'u2ip-1');
    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tUrl_2), tExpect, 'u2ip-2');
    pUnit.assertEqual('Leave just Id part.', fUrl2Id(tExpect), tExpect, 'u2ip-3');
  }

  // ------
  pTest.addTest(unitUrl2Id_fail);
  function unitUrl2Id_fail() {
    let e = pUnit.assertThrow('Expect a throw.', fUrl2Id.bind(null,[3,4]), 'u2if-1');
    pUnit.assertTrue('', e instanceof SyntaxError, 'u2if-2')
    pUnit.assertEqual('', e.message, 'Expected a string.', 'u2if-3');
    pUnit.assertEqual('', e.name, 'SyntaxError', 'u2if-4');

    e = pUnit.assertThrow('Expect a throw for empty.', fUrl2Id.bind(null, 'https://'), 'u2if-5');
    pUnit.assertTrue('', e instanceof Error, 'u2if-6')
    pUnit.assertEqual('', e.message, 'Invalid Id. Empty', 'u2if-7');
    
    let tShortId = '1p7YY3_t9RDwjVInORTRuDYzZP1'
    e = pUnit.assertThrow('Expect a throw for too short.', fUrl2Id.bind(null, tShortId), 'u2if-8');
    pUnit.assertTrue('', e instanceof Error, 'u2if-9')
    pUnit.assertEqual('', e.message, 'Invalid Id. Id must be 33 char long', 'u2if-10');

    let tBadCh = 'xp7YY3_t9RDwjVInORTRuDYzZP1-J8mQo'
    e = pUnit.assertThrow('Expect a throw for bad ch.', fUrl2Id.bind(null, tBadCh), 'u2if-14');
    pUnit.assertTrue('', e instanceof Error, 'u2if-15')
    pUnit.assertEqual('', e.message, 'Invalid Id. Id must begin with 1', 'u2if-16');
  }
} // defUnitUrl2Id

function defUnitHyper2Id(pTest, pUnit) {
  // ------
  pTest.addTest(unitHyper2Id_pass);
  function unitHyper2Id_pass() {
    let tInput_1 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';
    let tInput_2 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "https://foo.bar Id fdgdf dfgdf dfgdf f/")';
    let tExpect = '1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN';

    pUnit.assertEqual('Leave just Id part.', fHyper2Id(tInput_1), tExpect, 'h2ip-1');
    pUnit.assertEqual('Leave just Id part.', fHyper2Id(tInput_2), tExpect, 'h2ip-2');
  }

  // ------
  pTest.addTest(unitHyper2Id_fail);
  function unitHyper2Id_fail() {
    let tInput_1 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';
    let tInput_2 = '=HYPERLINK("https://drive.google.com/drive/folders/1jmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "https://foo.bar Id fdgdf dfgdf dfgdf f/")';
    let tInput_3 = '=HYPERLINK("https://drive.google.com/drive/folders/xjmmhsZ881wpjgza44D3-MtxhQ0Rz2RxN", "Id")';

    let e = pUnit.assertThrow('Expect a throw.', fHyper2Id.bind(null,[3,4]), 'h2if-1');
    pUnit.assertTrue('', e instanceof SyntaxError, 'h2if-2')
    pUnit.assertEqual('', e.message, 'Expected a string.', 'h2if-3');
    pUnit.assertEqual('', e.name, 'SyntaxError', 'h2if-4');

    e = pUnit.assertThrow('Expect a throw for bad ch.', fHyper2Id.bind(null, tInput_3), 'h2if-5');
    pUnit.assertTrue('', e instanceof Error, 'h2if-6')
    pUnit.assertEqual('', e.message, 'Invalid Id. Id must begin with 1', 'h2if-7');
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
