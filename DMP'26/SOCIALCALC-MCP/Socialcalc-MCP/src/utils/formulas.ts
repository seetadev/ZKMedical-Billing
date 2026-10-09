export interface FormulaInfo {
  name: string;
  category: string;
  desc: string;
  usage: string;
  example: string;
}

export const FORMULAS: FormulaInfo[] = [
  // Math & Trig
  { name: "ABS", category: "Math & Trig", desc: "Returns the absolute value of a number.", usage: "ABS(number)", example: "=ABS(-5) -> 5" },
  { name: "ACOS", category: "Math & Trig", desc: "Returns the arccosine of a number.", usage: "ACOS(number)", example: "=ACOS(0.5) -> 1.04719755" },
  { name: "ASIN", category: "Math & Trig", desc: "Returns the arcsine of a number.", usage: "ASIN(number)", example: "=ASIN(0.5) -> 0.52359877" },
  { name: "ATAN", category: "Math & Trig", desc: "Returns the arctangent of a number.", usage: "ATAN(number)", example: "=ATAN(1) -> 0.78539816" },
  { name: "ATAN2", category: "Math & Trig", desc: "Returns the arctangent of specified x and y coordinates.", usage: "ATAN2(x, y)", example: "=ATAN2(1, 1) -> 0.78539816" },
  { name: "COS", category: "Math & Trig", desc: "Returns the cosine of an angle (in radians).", usage: "COS(angle)", example: "=COS(PI()) -> -1" },
  { name: "EXP", category: "Math & Trig", desc: "Returns e raised to the power of a given number.", usage: "EXP(number)", example: "=EXP(1) -> 2.7182818" },
  { name: "INT", category: "Math & Trig", desc: "Rounds a number down to the nearest integer.", usage: "INT(number)", example: "=INT(4.8) -> 4" },
  { name: "LN", category: "Math & Trig", desc: "Returns the natural logarithm of a number.", usage: "LN(number)", example: "=LN(2.7182818) -> 1" },
  { name: "LOG", category: "Math & Trig", desc: "Returns the logarithm of a number to a specified base.", usage: "LOG(number, [base])", example: "=LOG(100, 10) -> 2" },
  { name: "MOD", category: "Math & Trig", desc: "Returns the remainder after a number is divided by a divisor.", usage: "MOD(number, divisor)", example: "=MOD(10, 3) -> 1" },
  { name: "PI", category: "Math & Trig", desc: "Returns the value of PI.", usage: "PI()", example: "=PI() -> 3.14159265" },
  { name: "POWER", category: "Math & Trig", desc: "Returns the result of a number raised to a power.", usage: "POWER(base, exponent)", example: "=POWER(2, 3) -> 8" },
  { name: "ROUND", category: "Math & Trig", desc: "Rounds a number to a specified number of digits.", usage: "ROUND(number, num_digits)", example: "=ROUND(2.15, 1) -> 2.2" },
  { name: "SIN", category: "Math & Trig", desc: "Returns the sine of an angle (in radians).", usage: "SIN(angle)", example: "=SIN(PI()/2) -> 1" },
  { name: "SQRT", category: "Math & Trig", desc: "Returns the positive square root of a number.", usage: "SQRT(number)", example: "=SQRT(16) -> 4" },
  { name: "TAN", category: "Math & Trig", desc: "Returns the tangent of an angle (in radians).", usage: "TAN(angle)", example: "=TAN(0) -> 0" },
  
  // Statistical
  { name: "AVERAGE", category: "Statistical", desc: "Returns the average (arithmetic mean) of its arguments.", usage: "AVERAGE(value1, [value2], ...)", example: "=AVERAGE(A1:A5)" },
  { name: "COUNT", category: "Statistical", desc: "Counts the number of cells that contain numbers.", usage: "COUNT(value1, [value2], ...)", example: "=COUNT(A1:A10)" },
  { name: "COUNTA", category: "Statistical", desc: "Counts the number of non-empty cells.", usage: "COUNTA(value1, [value2], ...)", example: "=COUNTA(A1:A10)" },
  { name: "COUNTBLANK", category: "Statistical", desc: "Counts the number of empty cells.", usage: "COUNTBLANK(range)", example: "=COUNTBLANK(A1:A10)" },
  { name: "COUNTIF", category: "Statistical", desc: "Counts the number of cells within a range that meet a single criteria.", usage: "COUNTIF(range, criteria)", example: "=COUNTIF(A1:A10, \">10\")" },
  { name: "MAX", category: "Statistical", desc: "Returns the maximum value in a set of values.", usage: "MAX(value1, [value2], ...)", example: "=MAX(A1:A5)" },
  { name: "MIN", category: "Statistical", desc: "Returns the minimum value in a set of values.", usage: "MIN(value1, [value2], ...)", example: "=MIN(A1:A5)" },
  { name: "STDEV", category: "Statistical", desc: "Estimates standard deviation based on a sample.", usage: "STDEV(value1, [value2], ...)", example: "=STDEV(A1:A10)" },
  { name: "SUM", category: "Statistical", desc: "Adds all the numbers in a range of cells.", usage: "SUM(value1, [value2], ...)", example: "=SUM(A1:A5)" },
  { name: "SUMIF", category: "Statistical", desc: "Adds cells specified by a given criteria.", usage: "SUMIF(range, criteria, [sum_range])", example: "=SUMIF(A1:A10, \">10\", B1:B10)" },
  { name: "VAR", category: "Statistical", desc: "Estimates variance based on a sample.", usage: "VAR(value1, [value2], ...)", example: "=VAR(A1:A10)" },

  // Text
  { name: "CONCATENATE", category: "Text", desc: "Joins several text items into one text item.", usage: "CONCATENATE(text1, [text2], ...)", example: "=CONCATENATE(\"Hello\", \" \", \"World\")" },
  { name: "FIND", category: "Text", desc: "Finds one text value within another (case-sensitive).", usage: "FIND(find_text, within_text, [start_num])", example: "=FIND(\"d\", \"world\") -> 5" },
  { name: "LEFT", category: "Text", desc: "Returns the first character or characters in a text string.", usage: "LEFT(text, [num_chars])", example: "=LEFT(\"hello\", 2) -> \"he\"" },
  { name: "LEN", category: "Text", desc: "Returns the number of characters in a text string.", usage: "LEN(text)", example: "=LEN(\"hello\") -> 5" },
  { name: "LOWER", category: "Text", desc: "Converts text to lowercase.", usage: "LOWER(text)", example: "=LOWER(\"HELLO\") -> \"hello\"" },
  { name: "MID", category: "Text", desc: "Returns a specific number of characters from a text string starting at the position you specify.", usage: "MID(text, start_num, num_chars)", example: "=MID(\"hello\", 2, 3) -> \"ell\"" },
  { name: "PROPER", category: "Text", desc: "Capitalizes the first letter in each word of a text value.", usage: "PROPER(text)", example: "=PROPER(\"hello world\") -> \"Hello World\"" },
  { name: "RIGHT", category: "Text", desc: "Returns the last character or characters in a text string.", usage: "RIGHT(text, [num_chars])", example: "=RIGHT(\"hello\", 2) -> \"lo\"" },
  { name: "SUBSTITUTE", category: "Text", desc: "Substitutes new text for old text in a text string.", usage: "SUBSTITUTE(text, old_text, new_text, [instance_num])", example: "=SUBSTITUTE(\"hello\", \"l\", \"x\") -> \"hexxo\"" },
  { name: "UPPER", category: "Text", desc: "Converts text to uppercase.", usage: "UPPER(text)", example: "=UPPER(\"hello\") -> \"HELLO\"" },

  // Date & Time
  { name: "DATE", category: "Date & Time", desc: "Returns the serial number of a particular date.", usage: "DATE(year, month, day)", example: "=DATE(2026, 7, 26)" },
  { name: "DAY", category: "Date & Time", desc: "Converts a serial number to a day of the month.", usage: "DAY(date)", example: "=DAY(TODAY())" },
  { name: "HOUR", category: "Date & Time", desc: "Converts a serial number to an hour.", usage: "HOUR(time)", example: "=HOUR(NOW())" },
  { name: "MINUTE", category: "Date & Time", desc: "Converts a serial number to a minute.", usage: "MINUTE(time)", example: "=MINUTE(NOW())" },
  { name: "MONTH", category: "Date & Time", desc: "Converts a serial number to a month.", usage: "MONTH(date)", example: "=MONTH(TODAY())" },
  { name: "NOW", category: "Date & Time", desc: "Returns the serial number of current date and time.", usage: "NOW()", example: "=NOW()" },
  { name: "SECOND", category: "Date & Time", desc: "Converts a serial number to a second.", usage: "SECOND(time)", example: "=SECOND(NOW())" },
  { name: "TIME", category: "Date & Time", desc: "Returns the serial number of a particular time.", usage: "TIME(hour, minute, second)", example: "=TIME(12, 30, 0)" },
  { name: "TODAY", category: "Date & Time", desc: "Returns the serial number of today's date.", usage: "TODAY()", example: "=TODAY()" },
  { name: "YEAR", category: "Date & Time", desc: "Converts a serial number to a year.", usage: "YEAR(date)", example: "=YEAR(TODAY())" },

  // Logical
  { name: "AND", category: "Logical", desc: "Returns TRUE if all of its arguments are TRUE.", usage: "AND(logical1, [logical2], ...)", example: "=AND(1+1=2, 2+2=4) -> TRUE" },
  { name: "FALSE", category: "Logical", desc: "Returns the logical value FALSE.", usage: "FALSE()", example: "=FALSE()" },
  { name: "IF", category: "Logical", desc: "Specifies a logical test to perform.", usage: "IF(logical_test, value_if_true, value_if_false)", example: "=IF(A1>10, \"High\", \"Low\")" },
  { name: "NOT", category: "Logical", desc: "Reverses the logic of its argument.", usage: "NOT(logical)", example: "=NOT(TRUE()) -> FALSE" },
  { name: "OR", category: "Logical", desc: "Returns TRUE if any argument is TRUE.", usage: "OR(logical1, [logical2], ...)", example: "=OR(1+1=2, 2+2=5) -> TRUE" },
  { name: "TRUE", category: "Logical", desc: "Returns the logical value TRUE.", usage: "TRUE()", example: "=TRUE()" },

  // Lookup & Reference
  { name: "CHOOSE", category: "Lookup & Reference", desc: "Chooses a value from a list of values.", usage: "CHOOSE(index_num, value1, [value2], ...)", example: "=CHOOSE(2, \"Red\", \"Blue\") -> \"Blue\"" },
  { name: "INDEX", category: "Lookup & Reference", desc: "Uses an index to choose a value from a reference or array.", usage: "INDEX(range, row_num, [column_num])", example: "=INDEX(A1:B5, 2, 1)" },
  { name: "MATCH", category: "Lookup & Reference", desc: "Looks up values in a reference or array.", usage: "MATCH(lookup_value, lookup_array, [match_type])", example: "=MATCH(\"apple\", A1:A5, 0)" },
  { name: "VLOOKUP", category: "Lookup & Reference", desc: "Looks for a value in the leftmost column of a table, and then returns a value in the same row from a column you specify.", usage: "VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])", example: "=VLOOKUP(\"Apple\", A1:C10, 2, FALSE)" },
  { name: "HLOOKUP", category: "Lookup & Reference", desc: "Looks for a value in the top row of a table and returns the value in the same column from a row you specify.", usage: "HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])", example: "=HLOOKUP(\"Total\", A1:C10, 3, FALSE)" },

  // Financial
  { name: "FV", category: "Financial", desc: "Returns the future value of an investment.", usage: "FV(rate, nper, pmt, [pv], [type])", example: "=FV(0.05/12, 60, -100)" },
  { name: "IRR", category: "Financial", desc: "Returns the internal rate of return for a series of cash flows.", usage: "IRR(values, [guess])", example: "=IRR(A1:A5)" },
  { name: "NPV", category: "Financial", desc: "Returns the net present value of an investment based on periodic cash flows and a discount rate.", usage: "NPV(rate, value1, [value2], ...)", example: "=NPV(0.08, B1:B5)" },
  { name: "PMT", category: "Financial", desc: "Returns the periodic payment for an annuity.", usage: "PMT(rate, nper, pv, [fv], [type])", example: "=PMT(0.06/12, 360, 200000)" },
  { name: "PV", category: "Financial", desc: "Returns the present value of an investment.", usage: "PV(rate, nper, pmt, [fv], [type])", example: "=PV(0.05/12, 60, 100)" }
];
