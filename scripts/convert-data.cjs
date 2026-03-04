// scripts/convert-data.cjs
const fs = require('fs');
const path = require('path');

// 读取原始数据文件并转换为TS模块
function convertJsToTs(inputFile, outputFile, varName) {
  // 读取文件内容
  let content = fs.readFileSync(inputFile, 'utf8');

  // 提取数组部分（去掉 const varName = [ 和 ]; 部分）
  const match = content.match(/=\s*\[(.*)\]/s);
  if (!match) {
    throw new Error(`Could not find array in ${inputFile}`);
  }

  // 获取数组内容
  let arrayContent = match[1].trim();

  // 确保每一行都正确缩进和格式化，保留原有的格式
  const tsContent = `// src/data/${outputFile}
// Auto-generated from original data file
export const ${varName} = [
${arrayContent}
];
`;

  // 写入新的TypeScript文件
  fs.writeFileSync(path.join(__dirname, `../src/data/${outputFile}`), tsContent);
  console.log(`Converted ${inputFile} -> src/data/${outputFile}`);
}

// 获取脚本所在目录的父目录（即项目根目录）
const projectRoot = path.dirname(__dirname);

// 转换所有题库文件
try {
  convertJsToTs(path.join(projectRoot, 'questions_class_A.js'), 'questions_A.ts', 'questionsData_A');
  convertJsToTs(path.join(projectRoot, 'questions_class_B.js'), 'questions_B.ts', 'questionsData_B');
  convertJsToTs(path.join(projectRoot, 'questions_class_C.js'), 'questions_C.ts', 'questionsData_C');
  console.log('All data files converted successfully!');
} catch (error) {
  console.error('Error converting data:', error.message);
}