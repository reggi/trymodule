#! /bin/sh

TEST_PATH=./tmp_testfolder
FAILED=0

export TRYMODULE_PATH=$TEST_PATH
export TRYMODULE_NONINTERACTIVE=true

run_test()
{
  echo "--------------"
  echo "## $1 | $2"
  $2
}

check_failure()
{
  if [ $? -ne 0 ]
  then
    echo "######## $1 !!!!!!!!!!!!!!"
    FAILED=1
  fi
}

check_should_error()
{
  if [ $? -ne 1 ]
  then
    echo "######## $1 !!!!!!!!!!!!!!"
    FAILED=1
  fi
}

run_test "Can install package 'colors'" "./index.js colors"
test -d $TEST_PATH/node_modules/colors
check_failure "node_modules/colors was not installed"

run_test "Can install packages 'colors' & 'lodash'" "./index.js colors lodash"
test -d $TEST_PATH/node_modules/colors
check_failure "node_modules/colors was not installed"
test -d $TEST_PATH/node_modules/lodash
check_failure "node_modules/lodash was not installed"

run_test "Cannot install missing package 'coloursssss'" "./index.js coloursssss"
test -d $TEST_PATH/node_modules/coloursssss
check_should_error "node_modules/coloursssss was installed"
echo "NOTE: Above error is normal and is fine, we're testing that we cannot install missing packages"

if [ $FAILED -eq 0 ]
then
  echo "\n\nALL TESTS PASSED!"
  rm -r $TEST_PATH
  exit 0
fi
echo "\n\nFAILING TESTS!"
rm -r $TEST_PATH
exit 1

