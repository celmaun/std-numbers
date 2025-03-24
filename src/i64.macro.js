// @ts-check
const { createMacro } = require('babel-plugin-macros');

/**
 * A macro that transforms i64(value) calls into BigInt.asIntN(64, value)
 */
function i64Macro({ references, babel }) {
  const { default: defaultImport = [] } = references;

  // Process all references to the default import (the i64 function)
  defaultImport.forEach((referencePath) => {
    if (referencePath.parentPath.type === 'CallExpression') {
      // Get the call expression that contains our i64 reference
      const callExpression = referencePath.parentPath;

      // Create a new member expression for BigInt.asIntN
      const memberExpression = babel.types.memberExpression(babel.types.identifier('BigInt'), babel.types.identifier('asIntN'));

      // Create a new call with BigInt.asIntN(64, ...originalArgs)
      const newCall = babel.types.callExpression(memberExpression, [babel.types.numericLiteral(64), ...callExpression.node.arguments]);

      // Replace the original call with our new one
      callExpression.replaceWith(newCall);
    } else {
      // Throw an error if i64 is not being called as a function
      throw new Error(`i64 can only be used as a function call, but was used as ${referencePath.parentPath.type}`);
    }
  });
}

// Export the macro
module.exports = createMacro(i64Macro);
