function surroundLatexPatterns(inputStr) {
    // Step 1: Split math expressions
    const mathSplit = inputStr.split(/(\$[^$]+\$|\$\$[^$]+\$\$|\\\([^()]+\)|\\\[[^\[\]]+\])/).filter(Boolean);

    // Step 2: Further split non-math parts while keeping LaTeX commands intact
    function splitCommands(input) {
        let result = [];
        let buffer = "";
        let stack = [];
        let inCommand = false;

        let pairs = { ')': '(', '}': '{', ']': '[' };
        let openBrackets = new Set(Object.values(pairs));
        let closeBrackets = new Set(Object.keys(pairs));

        for (let i = 0; i < input.length; i++) {
            let char = input[i];

            // Detect start of LaTeX command
            if (char === "\\" && !inCommand) {
                if (buffer) {
                    result.push(buffer);
                    buffer = "";
                }
                inCommand = true;
            }

            // Handle parentheses/braces matching
            if (openBrackets.has(char)) {
                stack.push(char);
            } else if (closeBrackets.has(char)) {
                if (stack.length === 0 || stack.pop() !== pairs[char]) {
                    throw new Error(`Unmatched closing bracket '${char}' at position ${i}`);
                }
            }

            buffer += char;

            // End of LaTeX command when brackets close
            if (inCommand && stack.length === 0 && (char === ' ' || i === input.length - 1)) {
                result.push(buffer.trim());
                buffer = "";
                inCommand = false;
            } else if (!inCommand && char === ' ') {
                if (buffer.trim()) result.push(buffer.trim());
                buffer = "";
            }
        }

        if (buffer) result.push(buffer);
        return result;
    }

    // Step 3: Process each part
    let finalResult = mathSplit.flatMap(part =>
        part.match(/^\$|\$\$|\\\(|\\\[.*$/) ? part : splitCommands(part)
    );

    // Step 4: Wrap LaTeX commands with `$ ... $`
    finalResult = finalResult.map(item =>
        item.startsWith("\\") && !/^\\(\(|\{|\[)/.test(item) ? `\$ \\\; ${item} \\\; \$` : item
    );

    // Step 5: Check for patterns like sometext() or sometext{} without spaces
    finalResult = finalResult.map(item => {
        if (
            /^[a-zA-Z0-9_]+\([^()]*\)$/.test(item) || // Matches sometext()
            /^[a-zA-Z0-9_]+\{[^{}]*\}$/.test(item)    // Matches sometext{}
        ) {
            console.log("--()-->", item);
            return `\$ \\\\${item} \$`; // Correctly update and return the modified item
        }
        return item; // Return unchanged items
    });

    
    
    console.log("------------------------------- \n", finalResult)
   // Return final formatted string
    inputStr = finalResult.join(" ");
    
    inputStr = inputStr.replace(/ \\ /g, '\\\\');
    inputStr = inputStr.replace(/ \\n /g, '\\\\');
    return inputStr;
}
