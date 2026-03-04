import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 该脚本用于随机打乱题目选项的顺序，并相应更新正确答案
 */

// 读取原始题目文件
const class_name = 'C';
const inputFile = path.join(__dirname, '../src/data/questions_' + class_name + '.ts');
const outputFile = path.join(__dirname, '../src/data/questions_' + class_name + '_shuffled.ts');

try {
  const data = fs.readFileSync(inputFile, 'utf8');

  // 提取题目数组部分
  const match = data.match(/export const questionsData_\w{1} = (\[.*\])/s);

  if (!match) {
    throw new Error('无法找到题目数组');
  }

  // 解析题目数组
  // 这里我们用一个更安全的方法来解析数据
  const questionsArrayString = match[1];

  // 使用Function构造函数安全地解析对象
  const questions = (new Function('return ' + questionsArrayString))();

  // 打乱每个题目的选项
  const shuffledQuestions = questions.map(question => {
    if (!question.options || !Array.isArray(question.options)) {
      return question; // 如果没有选项则直接返回原题
    }

    // 创建选项的副本和索引数组
    const originalOptions = [...question.options];
    const indices = Array.from({ length: originalOptions.length }, (_, i) => i);

    // Fisher-Yates洗牌算法打乱索引数组
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // 获取打乱后的选项内容（不包括字母标签）
    const shuffledOptionsContent = indices.map(idx => originalOptions[idx]);

    // 重新生成带有正确字母标签的选项
    const reorderedOptions = shuffledOptionsContent.map((option, index) => {
      return `${String.fromCharCode(65 + index)}. ${option.substring(3)}`; // 65是'A'的ASCII码，去掉原来的字母标签（前3个字符："A. "）
    });

    // 更新答案
    let newAnswer = '';
    if (question.answer && typeof question.answer === 'string') {
      // 对于多选题如 'AB' 或单选题如 'A'
      for (let char of question.answer) {
        // 计算原答案字符对应的索引 (A=0, B=1, C=2, D=3)
        const originalIndex = char.charCodeAt(0) - 'A'.charCodeAt(0);

        // 找到这个原索引在打乱后的索引数组中的新位置
        const newIndex = indices.indexOf(originalIndex);

        if (newIndex !== -1) {
          // 转换回字母
          newAnswer += String.fromCharCode(newIndex + 'A'.charCodeAt(0));
        }
      }

      // 按字母顺序排序答案以保持一致性
      newAnswer = newAnswer.split('').sort().join('');
    }

    // 返回带有新选项顺序和更新答案的新题目对象
    return {
      ...question,
      options: reorderedOptions,
      answer: newAnswer
    };
  });

  // 生成新的输出内容
  const outputContent = `// Auto-generated from original data
export const questionsData_${class_name} = ${JSON.stringify(shuffledQuestions, null, 2)}
`;

  // 写入新文件
  fs.writeFileSync(outputFile, outputContent, 'utf8');

  console.log(`成功生成打乱选项后的题目文件: ${outputFile}`);
  console.log(`共处理了 ${shuffledQuestions.length} 道题目`);

} catch (error) {
  console.error('处理题目文件时出错:', error.message);
}