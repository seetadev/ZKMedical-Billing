// @ts-nocheck
/**
 * SocialCalc Save Format Validator
 * 
 * A comprehensive validator for MSC (SocialCalc) save format files
 * with three validation levels: Syntax, Semantic, and Logic
 */

class SocialCalcValidator {
    constructor(options = {}) {
        this.options = {
            enableSyntaxLevel: options.enableSyntaxLevel !== false,
            enableSemanticLevel: options.enableSemanticLevel !== false,
            enableLogicLevel: options.enableLogicLevel !== false,
            verbose: options.verbose || false,
            maxErrors: options.maxErrors || 100,
            strictMode: options.strictMode || false
        };

        this.reset();
    }

    reset() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.lineNumber = 0;

        // Style registry
        this.styleDefinitions = {
            fonts: new Map(),
            colors: new Map(),
            borders: new Map(),
            layouts: new Map(),
            cellformats: new Map(),
            valueformats: new Map()
        };

        // Cell registry
        this.cells = new Map();
        this.cellFormulas = new Map();
        this.namedRanges = new Map();

        // Sheet properties
        this.sheetProperties = {
            maxCol: 0,
            maxRow: 0,
            version: null
        };

        // Validation statistics
        this.stats = {
            syntaxChecks: 0,
            semanticChecks: 0,
            logicChecks: 0,
            linesProcessed: 0
        };
    }

    /**
     * Main validation entry point
     */
    validate(saveStr) {
        this.reset();
        this.log('info', '='.repeat(60));
        this.log('info', 'Starting SocialCalc Validation');
        this.log('info', '='.repeat(60));

        if (!saveStr || typeof saveStr !== 'string') {
            this.addError(0, 'SYNTAX', 'Input must be a non-empty string');
            return this.getResult();
        }

        const lines = saveStr.split('\n');
        this.log('info', `Total lines to process: ${lines.length}`);

        // PASS 0: Version check (critical)
        if (this.options.enableSyntaxLevel) {
            this.log('info', '\n--- PASS 0: Version Validation ---');
            if (!this.validateVersion(lines)) {
                return this.getResult();
            }
        }

        // PASS 1: Collect style definitions (for semantic validation)
        if (this.options.enableSemanticLevel) {
            this.log('info', '\n--- PASS 1: Style Collection ---');
            this.collectStyleDefinitions(lines);
        }

        // PASS 2: Full validation
        this.log('info', '\n--- PASS 2: Full Line Validation ---');
        for (let i = 0; i < lines.length; i++) {
            this.lineNumber = i + 1;
            const line = lines[i].trim();

            if (!line || line.startsWith('#')) {
                continue; // Skip empty lines and comments
            }

            this.stats.linesProcessed++;
            this.validateLine(line);

            if (this.errors.length >= this.options.maxErrors) {
                this.log('info', `\nStopping: Maximum error count (${this.options.maxErrors}) reached`);
                break;
            }
        }

        // PASS 3: Logic-level validation
        // Run logic validation even if there were semantic errors, 
        // but only if we have enough valid structure (cells, formulas)
        if (this.options.enableLogicLevel && this.cells.size > 0) {
            this.log('info', '\n--- PASS 3: Logic Validation ---');
            this.validateLogic();
        }

        return this.getResult();
    }

    /**
     * PASS 0: Version validation
     */
    validateVersion(lines) {
        if (lines.length === 0) {
            this.addError(0, 'SYNTAX', 'File is empty');
            return false;
        }

        const firstLine = lines[0].trim();
        if (!firstLine.startsWith('version:')) {
            this.addError(1, 'SYNTAX', 'First line must be version declaration (e.g., version:1.5)');
            return false;
        }

        const parts = firstLine.split(':');
        if (parts.length !== 2) {
            this.addError(1, 'SYNTAX', `Invalid version line format. Expected 'version:X.X', got '${firstLine}'`);
            return false;
        }

        const version = parts[1];
        const knownVersions = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5'];

        this.sheetProperties.version = version;

        if (!knownVersions.includes(version)) {
            this.addWarning(1, 'SYNTAX', `Unknown version '${version}'. Known versions: ${knownVersions.join(', ')}`);
        } else {
            this.log('info', `✓ Valid version: ${version}`);
        }

        this.stats.syntaxChecks++;
        return true;
    }

    /**
     * PASS 1: Collect style definitions
     */
    collectStyleDefinitions(lines) {
        let collected = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;

            const lineType = line.substring(0, colonIndex);
            const rest = line.substring(colonIndex + 1);

            switch (lineType) {
                case 'font':
                case 'color':
                case 'border':
                case 'layout':
                case 'cellformat':
                case 'valueformat':
                    const nextColon = rest.indexOf(':');
                    if (nextColon > 0) {
                        const num = rest.substring(0, nextColon);
                        const definition = rest.substring(nextColon + 1);
                        this.styleDefinitions[lineType + 's'].set(num, definition);
                        collected++;
                        this.log('info', `  Collected ${lineType}:${num}`);
                    }
                    break;
            }
        }

        this.log('info', `✓ Collected ${collected} style definitions`);
    }

    /**
     * PASS 2: Validate individual line
     */
    validateLine(line) {
        const colonIndex = line.indexOf(':');

        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', `Invalid line format (missing ':'): ${line}`);
            return;
        }

        const lineType = line.substring(0, colonIndex);
        const rest = line.substring(colonIndex + 1);

        this.log('info', `  Line ${this.lineNumber}: ${lineType}`);

        switch (lineType) {
            case 'version':
                // Already validated in pass 0
                break;
            case 'cell':
                this.validateCellLine(rest);
                break;
            case 'sheet':
                this.validateSheetLine(rest);
                break;
            case 'col':
                this.validateColLine(rest);
                break;
            case 'row':
                this.validateRowLine(rest);
                break;
            case 'font':
                this.validateFontLine(rest);
                break;
            case 'color':
                this.validateColorLine(rest);
                break;
            case 'border':
                this.validateBorderLine(rest);
                break;
            case 'layout':
                this.validateLayoutLine(rest);
                break;
            case 'cellformat':
                this.validateCellFormatLine(rest);
                break;
            case 'valueformat':
                this.validateValueFormatLine(rest);
                break;
            case 'name':
                this.validateNameLine(rest);
                break;
            default:
                this.addWarning(this.lineNumber, 'SYNTAX', `Unknown line type: ${lineType}`);
        }
    }

    /**
     * Validate cell line: cell:COORD:attr:value:attr:value...
     * Special handling for vtf which contains colons in its value
     */
    validateCellLine(rest) {
        this.stats.syntaxChecks++;

        const parts = rest.split(':');
        if (parts.length < 1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Cell line must have at least coordinate');
            return;
        }

        const coord = parts[0];

        // SYNTAX: Validate coordinate format
        if (this.options.enableSyntaxLevel) {
            if (!this.isValidCoord(coord)) {
                this.addError(this.lineNumber, 'SYNTAX', `Invalid cell coordinate: '${coord}'. Expected format: A1, B5, AA10, etc.`);
                return;
            }
        }

        // Register cell
        this.cells.set(coord, { line: this.lineNumber, attrs: {} });

        // SYNTAX: Validate attributes
        if (this.options.enableSyntaxLevel) {
            const attrs = parts.slice(1);
            let i = 0;
            while (i < attrs.length) {
                if (i + 1 >= attrs.length) {
                    this.addError(this.lineNumber, 'SYNTAX', `Attribute '${attrs[i]}' missing value`);
                    break;
                }

                const attrName = attrs[i];
                let attrValue;

                // Special handling for vtf - it needs type, value, and formula (rest of string)
                // Formula can contain colons (ranges), so we take everything remaining
                if (attrName === 'vtf') {
                    if (i + 3 >= attrs.length) {
                        this.addError(this.lineNumber, 'SYNTAX', `Cell ${coord}: 'vtf' requires 3 parts (type:value:formula)`);
                        break;
                    }
                    const type = attrs[i + 1];
                    const value = attrs[i + 2];
                    const formula = attrs[i + 3];

                    if (!formula) {
                        this.addError(this.lineNumber, 'SYNTAX', `Cell ${coord}: 'vtf' formula cannot be empty`);
                        break;
                    }

                    attrValue = `${type}:${value}:${formula}`;
                    i += 4; // Consumed 4 parts
                }
                // Special handling for b (borders) - it needs exactly 4 colon-separated values
                else if (attrName === 'b') {
                    if (i + 4 >= attrs.length) {
                        this.addError(this.lineNumber, 'SYNTAX', `Cell ${coord}: 'b' requires 4 values (top:right:bottom:left)`);
                        break;
                    }
                    attrValue = `${attrs[i + 1]}:${attrs[i + 2]}:${attrs[i + 3]}:${attrs[i + 4]}`;
                    i += 5; // Skip the 4 parts we just consumed
                }
                else {
                    attrValue = attrs[i + 1];
                    i += 2;
                }

                this.cells.get(coord).attrs[attrName] = attrValue;
                this.validateCellAttribute(coord, attrName, attrValue);
            }
        }

        this.log('info', `    ✓ Cell ${coord} validated`);
    }

    /**
     * Validate individual cell attribute
     */
    validateCellAttribute(coord, attrName, attrValue) {
        switch (attrName) {
            case 'v': // Numeric value
                if (isNaN(attrValue)) {
                    this.addError(this.lineNumber, 'SYNTAX', `Cell ${coord}: attribute 'v' must be numeric, got '${attrValue}'`);
                }
                break;

            case 't': // Text value
                // Text can be anything, but check encoding
                if (attrValue.includes(':') && !attrValue.includes('\\c')) {
                    this.addWarning(this.lineNumber, 'SYNTAX', `Cell ${coord}: text contains unescaped ':' character`);
                }
                break;

            case 'vtf': // Value, type, formula
                const vtfParts = attrValue.split(':');
                if (vtfParts.length < 3) {
                    this.addError(this.lineNumber, 'SYNTAX', `Cell ${coord}: 'vtf' requires 3 parts (type:value:formula), got ${vtfParts.length}`);
                } else {
                    const [type, value, formula] = vtfParts;
                    this.validateValueType(coord, type);

                    // Store formula for logic validation
                    const decodedFormula = this.decodeFormula(formula);
                    this.cellFormulas.set(coord, decodedFormula);

                    if (this.options.enableSemanticLevel) {
                        this.validateFormulaBasicSyntax(coord, decodedFormula);
                    }
                }
                break;

            case 'f': // Font reference
                if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    if (!this.styleDefinitions.fonts.has(attrValue)) {
                        this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: font ${attrValue} not defined. Add 'font:${attrValue}:...' line`);
                    }
                }
                break;

            case 'c': // Text color reference
                if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    if (!this.styleDefinitions.colors.has(attrValue)) {
                        this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: color ${attrValue} not defined. Add 'color:${attrValue}:...' line`);
                    }
                }
                break;

            case 'bg': // Background color reference
                if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    if (!this.styleDefinitions.colors.has(attrValue)) {
                        this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: background color ${attrValue} not defined. Add 'color:${attrValue}:...' line`);
                    }
                }
                break;

            case 'cf': // Cell format reference
                if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    if (!this.styleDefinitions.cellformats.has(attrValue)) {
                        this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: cellformat ${attrValue} not defined. Add 'cellformat:${attrValue}:...' line`);
                    }
                }
                break;

            case 'l': // Layout reference
                if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    if (!this.styleDefinitions.layouts.has(attrValue)) {
                        this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: layout ${attrValue} not defined. Add 'layout:${attrValue}:...' line`);
                    }
                }
                break;

            case 'ntvf': // Number type value format reference
                if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    if (!this.styleDefinitions.valueformats.has(attrValue)) {
                        this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: valueformat ${attrValue} not defined. Add 'valueformat:${attrValue}:...' line`);
                    }
                }
                break;

            case 'tvf': // Text value format reference
                if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    if (!this.styleDefinitions.valueformats.has(attrValue)) {
                        this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: valueformat ${attrValue} not defined. Add 'valueformat:${attrValue}:...' line`);
                    }
                }
                break;

            case 'b': // Borders (4 values: top, right, bottom, left)
                const borderParts = attrValue.split(':');
                if (borderParts.length !== 4) {
                    this.addError(this.lineNumber, 'SYNTAX', `Cell ${coord}: 'b' attribute requires 4 border numbers (top:right:bottom:left), got ${borderParts.length}`);
                } else if (this.options.enableSemanticLevel) {
                    this.stats.semanticChecks++;
                    borderParts.forEach((borderNum, index) => {
                        if (borderNum !== '0' && !this.styleDefinitions.borders.has(borderNum)) {
                            const sides = ['top', 'right', 'bottom', 'left'];
                            this.addError(this.lineNumber, 'SEMANTIC', `Cell ${coord}: ${sides[index]} border ${borderNum} not defined. Add 'border:${borderNum}:...' line`);
                        }
                    });
                }
                break;

            case 'colspan':
            case 'rowspan':
                const span = parseInt(attrValue);
                if (isNaN(span) || span < 1) {
                    this.addError(this.lineNumber, 'SYNTAX', `Cell ${coord}: '${attrName}' must be positive integer, got '${attrValue}'`);
                }
                break;

            default:
                // Unknown attributes are warnings, not errors (extensibility)
                this.addWarning(this.lineNumber, 'SYNTAX', `Cell ${coord}: unknown attribute '${attrName}'`);
        }
    }

    /**
     * Validate sheet line: sheet:attr:value:attr:value...
     */
    validateSheetLine(rest) {
        this.stats.syntaxChecks++;

        const parts = rest.split(':');
        for (let i = 0; i < parts.length; i += 2) {
            if (i + 1 >= parts.length) {
                this.addError(this.lineNumber, 'SYNTAX', `Sheet attribute '${parts[i]}' missing value`);
                continue;
            }

            const attrName = parts[i];
            const attrValue = parts[i + 1];

            switch (attrName) {
                case 'c': // Last column
                    const col = parseInt(attrValue);
                    if (isNaN(col) || col < 1) {
                        this.addError(this.lineNumber, 'SYNTAX', `Sheet 'c' (columns) must be positive integer, got '${attrValue}'`);
                    } else {
                        this.sheetProperties.maxCol = col;
                    }
                    break;

                case 'r': // Last row
                    const row = parseInt(attrValue);
                    if (isNaN(row) || row < 1) {
                        this.addError(this.lineNumber, 'SYNTAX', `Sheet 'r' (rows) must be positive integer, got '${attrValue}'`);
                    } else {
                        this.sheetProperties.maxRow = row;
                    }
                    break;

                case 'w': // Default width
                case 'h': // Default height
                    if (!this.isValidSize(attrValue)) {
                        this.addWarning(this.lineNumber, 'SYNTAX', `Sheet '${attrName}' has unusual value '${attrValue}'`);
                    }
                    break;

                case 'recalc':
                    if (attrValue !== 'on' && attrValue !== 'off') {
                        this.addError(this.lineNumber, 'SYNTAX', `Sheet 'recalc' must be 'on' or 'off', got '${attrValue}'`);
                    }
                    break;

                case 'needsrecalc':
                    if (attrValue !== 'yes' && attrValue !== 'no') {
                        this.addError(this.lineNumber, 'SYNTAX', `Sheet 'needsrecalc' must be 'yes' or 'no', got '${attrValue}'`);
                    }
                    break;

                default:
                    this.addWarning(this.lineNumber, 'SYNTAX', `Unknown sheet attribute: ${attrName}`);
            }
        }

        this.log('info', `    ✓ Sheet properties validated`);
    }

    /**
     * Validate column line: col:COLID:attr:value...
     */
    validateColLine(rest) {
        this.stats.syntaxChecks++;

        const parts = rest.split(':');
        if (parts.length < 1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Column line must have column identifier');
            return;
        }

        const colId = parts[0];
        if (!this.isValidColId(colId)) {
            this.addError(this.lineNumber, 'SYNTAX', `Invalid column identifier: '${colId}'. Expected: A, B, AA, etc.`);
            return;
        }

        // Validate attributes
        for (let i = 1; i < parts.length; i += 2) {
            if (i + 1 >= parts.length) {
                this.addError(this.lineNumber, 'SYNTAX', `Column ${colId} attribute '${parts[i]}' missing value`);
                continue;
            }

            const attrName = parts[i];
            const attrValue = parts[i + 1];

            if (attrName === 'w') { // Width
                if (!this.isValidSize(attrValue)) {
                    this.addError(this.lineNumber, 'SYNTAX', `Column ${colId} width '${attrValue}' invalid`);
                }
            } else {
                this.addWarning(this.lineNumber, 'SYNTAX', `Unknown column attribute: ${attrName}`);
            }
        }

        this.log('info', `    ✓ Column ${colId} validated`);
    }

    /**
     * Validate row line: row:ROWNUM:attr:value...
     */
    validateRowLine(rest) {
        this.stats.syntaxChecks++;

        const parts = rest.split(':');
        if (parts.length < 1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Row line must have row number');
            return;
        }

        const rowNum = parts[0];
        if (!/^\d+$/.test(rowNum)) {
            this.addError(this.lineNumber, 'SYNTAX', `Invalid row number: '${rowNum}'. Expected positive integer`);
            return;
        }

        // Validate attributes
        for (let i = 1; i < parts.length; i += 2) {
            if (i + 1 >= parts.length) {
                this.addError(this.lineNumber, 'SYNTAX', `Row ${rowNum} attribute '${parts[i]}' missing value`);
                continue;
            }

            const attrName = parts[i];
            const attrValue = parts[i + 1];

            if (attrName === 'h') { // Height
                if (!this.isValidSize(attrValue)) {
                    this.addError(this.lineNumber, 'SYNTAX', `Row ${rowNum} height '${attrValue}' invalid`);
                }
            } else {
                this.addWarning(this.lineNumber, 'SYNTAX', `Unknown row attribute: ${attrName}`);
            }
        }

        this.log('info', `    ✓ Row ${rowNum} validated`);
    }

    /**
     * Validate font line: font:NUM:style weight size family
     * Format is flexible:
     *   - "style weight size family" (4+ parts)
     *   - "style weight family" (3+ parts, no size)
     *   - "* size *" (3 parts, only size specified)
     */
    validateFontLine(rest) {
        this.stats.syntaxChecks++;

        const colonIndex = rest.indexOf(':');
        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Font line must have number and definition');
            return;
        }

        const num = rest.substring(0, colonIndex);
        const definition = rest.substring(colonIndex + 1);

        if (!/^\d+$/.test(num)) {
            this.addError(this.lineNumber, 'SYNTAX', `Font number must be positive integer, got '${num}'`);
            return;
        }

        // Parse font definition
        const parts = definition.split(' ');
        if (parts.length < 3) {
            this.addError(this.lineNumber, 'SYNTAX', `Font definition requires at least 3 parts, got ${parts.length}`);
            return;
        }

        const firstPart = parts[0];
        const secondPart = parts[1];
        const thirdPart = parts[2];

        // Check if it's the shorthand format: "* size *"
        if (firstPart === '*' && thirdPart === '*' && this.isValidFontSize(secondPart)) {
            // Shorthand: only size is specified
            if (!this.isValidFontSize(secondPart)) {
                this.addError(this.lineNumber, 'SYNTAX', `Font size '${secondPart}' invalid`);
            }
            this.log('info', `    ✓ Font ${num} validated (size-only format)`);
            return;
        }

        // Standard format: style weight [size] [family]
        const style = firstPart;
        const weight = secondPart;

        // Validate style
        if (style !== '*' && style !== 'normal' && style !== 'italic') {
            this.addError(this.lineNumber, 'SYNTAX', `Font style must be 'normal', 'italic', or '*', got '${style}'`);
        }

        // Validate weight
        if (weight !== '*' && weight !== 'normal' && weight !== 'bold') {
            this.addError(this.lineNumber, 'SYNTAX', `Font weight must be 'normal', 'bold', or '*', got '${weight}'`);
        }

        // Third part could be size OR start of family
        if (this.isValidFontSize(thirdPart) || thirdPart === '*') {
            // It's a size, validate it
            if (thirdPart !== '*' && !this.isValidFontSize(thirdPart)) {
                this.addError(this.lineNumber, 'SYNTAX', `Font size '${thirdPart}' invalid. Expected: 12pt, 14px, small, medium, large, x-large, or *`);
            }
            // Family is the rest (parts 3+)
        } else {
            // Third part is start of family, size was omitted
        }

        this.log('info', `    ✓ Font ${num} validated`);
    }

    /**
     * Validate color line: color:NUM:rgb(R,G,B) or color:NUM:#RRGGBB
     */
    validateColorLine(rest) {
        this.stats.syntaxChecks++;

        const colonIndex = rest.indexOf(':');
        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Color line must have number and definition');
            return;
        }

        const num = rest.substring(0, colonIndex);
        const definition = rest.substring(colonIndex + 1);

        if (!/^\d+$/.test(num)) {
            this.addError(this.lineNumber, 'SYNTAX', `Color number must be positive integer, got '${num}'`);
            return;
        }

        // Validate color format
        if (definition.startsWith('rgb(')) {
            // rgb(R,G,B) format
            const match = definition.match(/^rgb\((\d+),(\d+),(\d+)\)$/);
            if (!match) {
                this.addError(this.lineNumber, 'SYNTAX', `Invalid RGB color format: '${definition}'. Expected: rgb(R,G,B)`);
            } else {
                const [, r, g, b] = match;
                if (parseInt(r) > 255 || parseInt(g) > 255 || parseInt(b) > 255) {
                    this.addError(this.lineNumber, 'SYNTAX', `RGB values must be 0-255, got rgb(${r},${g},${b})`);
                }
            }
        } else if (definition.startsWith('#')) {
            // #RRGGBB format
            if (!/^#[0-9A-Fa-f]{6}$/.test(definition)) {
                this.addError(this.lineNumber, 'SYNTAX', `Invalid hex color format: '${definition}'. Expected: #RRGGBB`);
            }
        } else {
            this.addError(this.lineNumber, 'SYNTAX', `Color must be rgb(R,G,B) or #RRGGBB format, got '${definition}'`);
        }

        this.log('info', `    ✓ Color ${num} validated`);
    }

    /**
     * Validate border line: border:NUM:thickness style color
     */
    validateBorderLine(rest) {
        this.stats.syntaxChecks++;

        const colonIndex = rest.indexOf(':');
        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Border line must have number and definition');
            return;
        }

        const num = rest.substring(0, colonIndex);
        const definition = rest.substring(colonIndex + 1);

        if (!/^\d+$/.test(num)) {
            this.addError(this.lineNumber, 'SYNTAX', `Border number must be positive integer, got '${num}'`);
            return;
        }

        // Parse border definition: thickness style color
        const parts = definition.split(' ');
        if (parts.length < 3) {
            this.addError(this.lineNumber, 'SYNTAX', `Border definition requires 3 parts (thickness style color), got ${parts.length}`);
            return;
        }

        const [thickness, style, ...colorParts] = parts;
        const color = colorParts.join(' ');

        // Validate thickness
        if (!/^\d+px$/.test(thickness)) {
            this.addError(this.lineNumber, 'SYNTAX', `Border thickness must be in pixels (e.g., 1px), got '${thickness}'`);
        }

        // Validate style
        const validStyles = ['solid', 'dashed', 'dotted', 'double', 'none'];
        if (!validStyles.includes(style)) {
            this.addError(this.lineNumber, 'SYNTAX', `Border style must be one of ${validStyles.join(', ')}, got '${style}'`);
        }

        // Validate color (rgb or hex)
        if (!color.startsWith('rgb(') && !color.startsWith('#')) {
            this.addError(this.lineNumber, 'SYNTAX', `Border color must be rgb() or #hex format, got '${color}'`);
        }

        this.log('info', `    ✓ Border ${num} validated`);
    }

    /**
     * Validate layout line: layout:NUM:definition
     */
    validateLayoutLine(rest) {
        this.stats.syntaxChecks++;

        const colonIndex = rest.indexOf(':');
        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Layout line must have number and definition');
            return;
        }

        const num = rest.substring(0, colonIndex);
        const definition = rest.substring(colonIndex + 1);

        if (!/^\d+$/.test(num)) {
            this.addError(this.lineNumber, 'SYNTAX', `Layout number must be positive integer, got '${num}'`);
            return;
        }

        // Layout definition should contain padding and/or vertical-align
        if (!definition.includes('padding:') && !definition.includes('vertical-align:')) {
            this.addWarning(this.lineNumber, 'SYNTAX', `Layout ${num} definition doesn't contain padding or vertical-align`);
        }

        this.log('info', `    ✓ Layout ${num} validated`);
    }

    /**
     * Validate cellformat line: cellformat:NUM:alignment
     */
    validateCellFormatLine(rest) {
        this.stats.syntaxChecks++;

        const colonIndex = rest.indexOf(':');
        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Cell format line must have number and alignment');
            return;
        }

        const num = rest.substring(0, colonIndex);
        const alignment = rest.substring(colonIndex + 1);

        if (!/^\d+$/.test(num)) {
            this.addError(this.lineNumber, 'SYNTAX', `Cell format number must be positive integer, got '${num}'`);
            return;
        }

        const validAlignments = ['left', 'center', 'right'];
        if (!validAlignments.includes(alignment)) {
            this.addError(this.lineNumber, 'SYNTAX', `Cell format alignment must be one of ${validAlignments.join(', ')}, got '${alignment}'`);
        }

        this.log('info', `    ✓ Cell format ${num} validated`);
    }

    /**
     * Validate valueformat line: valueformat:NUM:format
     */
    validateValueFormatLine(rest) {
        this.stats.syntaxChecks++;

        const colonIndex = rest.indexOf(':');
        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Value format line must have number and format');
            return;
        }

        const num = rest.substring(0, colonIndex);
        const format = rest.substring(colonIndex + 1);

        if (!/^\d+$/.test(num)) {
            this.addError(this.lineNumber, 'SYNTAX', `Value format number must be positive integer, got '${num}'`);
            return;
        }

        // Format can be complex, just check it's not empty
        if (!format) {
            this.addError(this.lineNumber, 'SYNTAX', `Value format ${num} definition is empty`);
        }

        this.log('info', `    ✓ Value format ${num} validated`);
    }

    /**
     * Validate name line: name:NAME:definition
     */
    validateNameLine(rest) {
        this.stats.syntaxChecks++;

        const colonIndex = rest.indexOf(':');
        if (colonIndex === -1) {
            this.addError(this.lineNumber, 'SYNTAX', 'Name line must have name and definition');
            return;
        }

        const name = rest.substring(0, colonIndex);
        const definition = rest.substring(colonIndex + 1);

        if (!name) {
            this.addError(this.lineNumber, 'SYNTAX', 'Name cannot be empty');
            return;
        }

        this.namedRanges.set(name, definition);

        this.log('info', `    ✓ Named range '${name}' validated`);
    }

    /**
     * PASS 3: Logic-level validation
     */
    validateLogic() {
        this.log('info', 'Performing logic-level validation...');

        // Check cell references in formulas
        this.validateCellReferences();

        // Check for circular references
        this.validateCircularReferences();

        // Validate ranges
        this.validateRanges();

        this.log('info', `✓ Logic validation complete`);
    }

    /**
     * Validate cell references in formulas
     */
    validateCellReferences() {
        this.log('info', '  Checking cell references...');

        for (const [coord, formula] of this.cellFormulas) {
            const refs = this.extractCellReferences(formula);

            for (const ref of refs) {
                this.stats.logicChecks++;

                if (!this.cells.has(ref)) {
                    // Check if it's in a valid range
                    const cellData = this.cells.get(coord);
                    if (cellData && this.options.enableLogicLevel) {
                        this.addWarning(cellData.line, 'LOGIC',
                            `Cell ${coord}: formula references undefined cell ${ref}`);
                    }
                }
            }
        }
    }

    /**
     * Validate circular references
     */
    validateCircularReferences() {
        this.log('info', '  Checking circular references...');

        const visited = new Set();
        const recursionStack = new Set();

        const detectCycle = (coord, path = []) => {
            if (recursionStack.has(coord)) {
                const cycle = [...path, coord];
                const cellData = this.cells.get(coord);
                if (cellData) {
                    this.addError(cellData.line, 'LOGIC',
                        `Circular reference detected: ${cycle.join(' → ')}`);
                }
                return true;
            }

            if (visited.has(coord)) {
                return false;
            }

            visited.add(coord);
            recursionStack.add(coord);

            const formula = this.cellFormulas.get(coord);
            if (formula) {
                const refs = this.extractCellReferences(formula);
                for (const ref of refs) {
                    this.stats.logicChecks++;
                    if (detectCycle(ref, [...path, coord])) {
                        recursionStack.delete(coord);
                        return true;
                    }
                }
            }

            recursionStack.delete(coord);
            return false;
        };

        for (const coord of this.cellFormulas.keys()) {
            detectCycle(coord);
        }
    }

    /**
     * Validate ranges in formulas
     */
    validateRanges() {
        this.log('info', '  Checking range validity...');

        for (const [coord, formula] of this.cellFormulas) {
            const ranges = this.extractRanges(formula);

            for (const range of ranges) {
                this.stats.logicChecks++;

                const parts = range.split(':');
                if (parts.length === 2) {
                    const [start, end] = parts;

                    if (!this.isValidCoord(start) || !this.isValidCoord(end)) {
                        const cellData = this.cells.get(coord);
                        if (cellData) {
                            this.addError(cellData.line, 'LOGIC',
                                `Cell ${coord}: invalid range ${range}`);
                        }
                    }
                }
            }
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Validate coordinate format
     */
    isValidCoord(coord) {
        // Format: A1, B5, AA10, ZZ999, etc.
        return /^[A-Z]+[0-9]+$/.test(coord);
    }

    /**
     * Validate column identifier
     */
    isValidColId(colId) {
        return /^[A-Z]+$/.test(colId);
    }

    /**
     * Validate size value
     */
    isValidSize(size) {
        return /^\d+$/.test(size) ||
            /^\d+px$/.test(size) ||
            /^\d+%$/.test(size) ||
            size === 'auto';
    }

    /**
     * Validate font size
     */
    isValidFontSize(size) {
        return /^\d+pt$/.test(size) ||
            /^\d+px$/.test(size) ||
            ['small', 'medium', 'large', 'x-large', 'x-small', 'xx-small', 'xx-large'].includes(size);
    }

    /**
     * Validate value type
     */
    validateValueType(coord, type) {
        const validTypes = ['n', 'nt', 'nd', 'ndt', 'n$', 'n%', 'nl', 'e'];
        if (!validTypes.includes(type) && !type.startsWith('e')) {
            this.addWarning(this.lineNumber, 'SYNTAX',
                `Cell ${coord}: unusual value type '${type}'`);
        }
    }

    /**
     * Decode formula from save format
     */
    decodeFormula(encoded) {
        return encoded
            .replace(/\\c/g, ':')
            .replace(/\\n/g, '\n')
            .replace(/\\b/g, '\\');
    }

    /**
     * Basic formula syntax validation
     */
    validateFormulaBasicSyntax(coord, formula) {
        this.stats.semanticChecks++;

        // Check parentheses balance
        let parenCount = 0;
        for (const char of formula) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (parenCount < 0) {
                this.addError(this.lineNumber, 'SEMANTIC',
                    `Cell ${coord}: unbalanced parentheses in formula`);
                return;
            }
        }
        if (parenCount !== 0) {
            this.addError(this.lineNumber, 'SEMANTIC',
                `Cell ${coord}: unbalanced parentheses in formula`);
        }

        // Check for known functions
        const knownFunctions = [
            'ABS', 'ACOS', 'AND', 'ASIN', 'ATAN', 'ATAN2', 'AVERAGE', 'CHOOSE', 'COS', 'COUNT',
            'COUNTA', 'COUNTBLANK', 'COUNTIF', 'DATE', 'DAY', 'DDB', 'DEGREES', 'EVEN', 'EXACT',
            'EXP', 'FACT', 'FALSE', 'FIND', 'FV', 'HLOOKUP', 'HOUR', 'IF', 'INDEX', 'INT', 'IRR',
            'ISBLANK', 'ISERR', 'ISERROR', 'ISLOGICAL', 'ISNA', 'ISNONTEXT', 'ISTEXT', 'LEFT',
            'LEN', 'LN', 'LOG', 'LOG10', 'LOWER', 'MATCH', 'MAX', 'MID', 'MIN', 'MINUTE', 'MOD',
            'MONTH', 'N', 'NA', 'NPER', 'NPV', 'NOW', 'ODD', 'OR', 'PI', 'PMT', 'POWER', 'PRODUCT',
            'PROPER', 'PV', 'RADIANS', 'RATE', 'REPLACE', 'REPT', 'RIGHT', 'ROUND', 'ROWS',
            'COLUMNS', 'SECOND', 'SIN', 'SLN', 'SQRT', 'STDEV', 'STDEVP', 'SUBSTITUTE', 'SUM',
            'SUMIF', 'SYD', 'T', 'TAN', 'TIME', 'TODAY', 'TRUE', 'TRUNC', 'UPPER', 'VALUE', 'VAR',
            'VARP', 'VLOOKUP', 'WEEKDAY', 'YEAR'
        ];

        const functionPattern = /([A-Z]+)\s*\(/g;
        let match;
        while ((match = functionPattern.exec(formula)) !== null) {
            const funcName = match[1];
            if (!knownFunctions.includes(funcName)) {
                this.addWarning(this.lineNumber, 'SEMANTIC',
                    `Cell ${coord}: unknown function '${funcName}' in formula`);
            }
        }
    }

    /**
     * Extract cell references from formula
     */
    extractCellReferences(formula) {
        // Remove cross-sheet references first (e.g. 'Revenue!C10' or 'Revenue!C10:BJ10')
        // to avoid incorrect circular references or undefined cell references on the current sheet
        const cleanedFormula = formula.replace(/[A-Za-z0-9_& ]+![A-Z]+[0-9]+(?::[A-Z]+[0-9]+)?/g, '');

        const refs = [];
        const pattern = /\b([A-Z]+[0-9]+)\b/g;
        let match;
        while ((match = pattern.exec(cleanedFormula)) !== null) {
            refs.push(match[1]);
        }
        return refs;
    }

    /**
     * Extract ranges from formula (both valid and potentially invalid)
     */
    extractRanges(formula) {
        // Remove cross-sheet ranges first to avoid matching them as local ranges
        const cleanedFormula = formula.replace(/[A-Za-z0-9_& ]+![A-Z]+[0-9]+(?::[A-Z]+[0-9]+)?/g, '');

        const ranges = [];
        // Look for cell range patterns: LETTER+NUMBER : LETTER+NUMBER
        // This avoids matching numeric literals like 1:2:3:4
        const pattern = /([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g;
        let match;
        while ((match = pattern.exec(cleanedFormula)) !== null) {
            ranges.push(match[0]);
        }
        return ranges;
    }

    /**
     * Add error
     */
    addError(lineNum, level, message) {
        this.errors.push({ line: lineNum, level, type: 'ERROR', message });
        if (this.options.verbose) {
            console.error(`    ✗ ERROR [${level}] Line ${lineNum}: ${message}`);
        }
    }

    /**
     * Add warning
     */
    addWarning(lineNum, level, message) {
        if (this.options.strictMode) {
            this.addError(lineNum, level, message);
        } else {
            this.warnings.push({ line: lineNum, level, type: 'WARNING', message });
            if (this.options.verbose) {
                console.warn(`    ⚠ WARNING [${level}] Line ${lineNum}: ${message}`);
            }
        }
    }

    /**
     * Log info message
     */
    log(level, message) {
        if (this.options.verbose) {
            console.log(message);
        }
        this.info.push({ level, message });
    }

    /**
     * Get validation result
     */
    getResult() {
        const valid = this.errors.length === 0;

        this.log('info', '\n' + '='.repeat(60));
        this.log('info', 'VALIDATION SUMMARY');
        this.log('info', '='.repeat(60));
        this.log('info', `Status: ${valid ? '✅ VALID' : '❌ INVALID'}`);
        this.log('info', `Lines processed: ${this.stats.linesProcessed}`);
        this.log('info', `Errors: ${this.errors.length}`);
        this.log('info', `Warnings: ${this.warnings.length}`);
        this.log('info', `\nValidation checks performed:`);
        this.log('info', `  - Syntax checks: ${this.stats.syntaxChecks}`);
        this.log('info', `  - Semantic checks: ${this.stats.semanticChecks}`);
        this.log('info', `  - Logic checks: ${this.stats.logicChecks}`);
        this.log('info', '='.repeat(60));

        return {
            valid,
            errors: this.errors,
            warnings: this.warnings,
            errorCount: this.errors.length,
            warningCount: this.warnings.length,
            stats: this.stats,
            styleDefinitions: {
                fonts: this.styleDefinitions.fonts.size,
                colors: this.styleDefinitions.colors.size,
                borders: this.styleDefinitions.borders.size,
                layouts: this.styleDefinitions.layouts.size,
                cellformats: this.styleDefinitions.cellformats.size,
                valueformats: this.styleDefinitions.valueformats.size
            },
            cells: this.cells.size,
            formulas: this.cellFormulas.size
        };
    }
}

export default SocialCalcValidator;
