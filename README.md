# gdrive-rename-files

$Date: 2021/03/19 20:49:40 $ UTC

This Google Apps Script application will list and rename folders and
files in your Google Drive.

Why did I write this? My google drive was getting cluttered with files
that were named by others, who had a (bad) habit of using spaces and
lots of other special characters. (Usually, this is because people try
to encode too much information into a file name. But that is another
topic.) I would download, version, and process some files, then upload
them. Spaces and special characters in the file names messed my
ability to write "simple" bash scripts. So how about a renaming tool
to normalize the file names? I.e. convert all the non-alphanumeric
characters to '_'. ('.' and '-' would be OK too.)

The app script is attached to a Google Sheet. The spreadsheet has and
Interface sheet-tab where you can fill in the pseudo form for your
options. The files are listed in another sheet-tab.

For more details see the
[User Guide](https://docs.google.com/document/d/e/2PACX-1vRQ8aH-xnfdVKmRKU7wLl2wmV87fvQSy_o1907iPiTUN56cKKcQrfjxAakGhLyYcHqCQ04dIhodkt6B/pub).
(This link is also in the Spreadsheet. And the source doc is versioned in:
Rename_Files_User_Guide.docx)

## Quick Start

You can get the latest stable version of the Spreadsheet, with the
scripts attached, in my Google Drive at:
[Released -> Software](https://drive.google.com/drive/u/0/folders/1fvYI6-K9wnxigz4XJovfEhzoY0m1_liI)

Copy the spreadsheet to your Google Drive.

(gdrive-util-scripts.xlsx is the base spreadsheet file, with no scripts.)

## Implementation Notes

This is my first "complete" Google Apps Script application. I used a
Test Driven Development process for creating this app. See my
[Clean Code](https://slowengineering.wordpress.com/2021/02/25/clean-code/)
blog post for why I used TDD. I started with another person's GSUnit
test library, but it disappeared (and the source code repo was not
complete), so I created my own test library and test driver. See
repository [gsunit-test](https://github.com/TurtleEngr/gsunit-test).

## Update Notes

If you want the latest code, you can replace the attached scripts, in
the spreadsheet, with the files you find in this repository. The order
of the files in the Script Editor matters, so don't move them
around. The required files are util-objs.gs and rename-files.gs

If you are changing the code, then you'll need all of the test script
files: gsunit-test.gs, test-util-objs.gs, and
test-rename-files.gs. Put them in that order after the rename-file.gs
script.

The Rename-Files menus will automatically updated when you reload the
spreadsheet.

If didn't start with the Quick Start Google Sheet, you can upload the
gdrive-util-scripts.xlsx to your Google Drive. Then attach the scripts.

## Coding Style

Experienced JavaScript programmers will probably not like my style.
JavaScript is a new language for me. I've been a software engineer for
40 years. I know more than 10 computer languages, and I'm am
proficient in 5. So I have developed my own way of using a subset
of languages. I.e. I do not used ALL of the quirky features that are
in most languages.

My "Clean Coding Style".

- I've just started to learn how to refactor by removing braces {}.

- I follow a naming convention that uses prefixes that help with
showing the "scope" of a variable, which I have found is more
important than its type. The type can be determined by its use, but
the scope will be unknown unless you go looking.  
**Prefix codes:**
	*  pName       - a parameter passed into a function
	*  pArg={}     - pass args *in any order* and set default values for most args
	*  tName       - a variable that is local to a function
	*  obj.name    - a class variable that a user can usually "get" or "set"
	*  obj._name   - a class variable that is assumed to be private (do not depend on it)
	*  obj.name()  - a class method
	*  _name()     - a function or method that is assumed to be private (do not depend on it)
	*  obj.uiName()- this method is probably called by a menuName() function
	*  menuName()  - a menu item is usually bound to these functions, and they call obj.uiName() methods
	*  fName()     - usually a global function
	*  runName()   - run the defined tests. No args, so that it can be called by a menu item. See RunTests class
	*  defName()   - define the unit test functions, and any setup/cleanup code. See RunTests class
	*  unitName()  - unit test functions in defName()
	*  assertName() - gsunit test asserts. See GsUnit class

- I try to push all error handling to catch() blocks. Also I try to do
the "throws" in low level functions, so that the upper level functions
are not cluttered with error handling.

- I try to refactor 'if' statements to exit early, to that will reduce
the need for 'else' statements.

- I try to put the bulk of the application in class objects. Yes, I
know "classes" in JavaScript are not really full classes. But I try to
write with a style as if they were, by avoiding "tricky" JavaScript
syntax.


Clean Coding and formal TDD is new for me, so my test code is very
messy. The GSUnit library needs to be enhanced to support begin/end
sections that will be run before and after test sections. Then the
duplicate code can be reduced. Also I probably put too many asserts in
the different test sections. However I did try to make sure there were
no dependencies between test functions.
