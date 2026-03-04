#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""解析业余无线电题库 txt 文件并生成 questionsData JavaScript"""
import re
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# 知识点分类关键词映射
TOPIC_KEYWORDS = {
    '无线电管理': ['无线电管理条例', '无线电管理办法', '监督管理', '管理机构', '法规', '许可', '执照'],
    '频率管理': ['频率', '频段', '划分', '分配', '指配', '波段', 'MHz', 'kHz', 'GHz'],
    '操作证书': ['操作证书', '操作技术能力', '考试', 'A 类', 'B 类', 'C 类', '验证'],
    '呼号管理': ['呼号', '电台呼号', '分区号'],
    '通信礼仪': ['呼叫', '通联', '礼貌', '语言', '通信程序', 'CQ'],
    '电波传播': ['传播', '电离层', '对流层', '地波', '天波', '视距', '衰落', '多径'],
    '天线基础': ['天线', '增益', '驻波比', '馈线', '偶极子', '振子', '极化', '方向图'],
    '电路基础': ['电路', '电阻', '电容', '电感', '电压', '电流', '功率', '欧姆', '阻抗'],
    '安全用电': ['安全', '触电', '防雷', '接地', '保险丝', '蓄电池'],
    '电磁兼容': ['干扰', '兼容', '杂散', '谐波', '噪声', '滤波'],
    '通信基础': ['调制', '解调', '带宽', '速率', '收发信机', 'SSB', 'FM', 'AM', 'CW'],
}

def determine_topic(question: str) -> str:
    """根据题目内容确定知识点分类"""
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(keyword in question for keyword in keywords):
            return topic
    return "其他"


def parse_question_block(block: str) -> Optional[Dict]:
    """解析单个题目块，返回题目数据或 None"""
    block = block.strip()
    if not block:
        return None

    # 确保块以 [J] 开头
    if not block.startswith('[J]'):
        block = '[J]' + block

    q_data = {
        'internal_id': '',
        'group_num': '',
        'question': '',
        'answer': '',
        'options': [],
        'attachment': ''
    }

    for line in block.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('[P]'):
            continue  # 章节号，暂不需要
        
        elif line.startswith('[J]'):
            q_data['internal_id'] = line[3:]
        elif line.startswith('[I]'):
            q_data['group_num'] = line[3:]
        elif line.startswith('[Q]'):
            q_data['question'] = line[3:]
        elif line.startswith('[T]'):
            q_data['answer'] = line[3:]
        elif line.startswith('[A]'):
            q_data['options'].append(f"A. {line[3:]}")
        elif line.startswith('[B]'):
            q_data['options'].append(f"B. {line[3:]}")
        elif line.startswith('[C]'):
            q_data['options'].append(f"C. {line[3:]}")
        elif line.startswith('[D]'):
            q_data['options'].append(f"D. {line[3:]}")
        elif line.startswith('[F]'):
            q_data['attachment'] = line[3:]

    return q_data


def parse_questions(txt_path: str) -> Tuple[List[Dict], Dict]:
    """从 txt 文件解析题目，返回题目列表和统计信息"""
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    stats = {'total': 0, 'with_attachment': 0, 'skipped': 0}

    # 按 [J] 分割题目块
    blocks = re.split(r'\n(?=\[J\])', content)

    for block in blocks:
        q_data = parse_question_block(block)
        if not q_data:
            stats['skipped'] += 1
            continue

        # 提取题目编号
        question_num = q_data['internal_id'] + ':' + q_data['group_num']

        # 验证必要字段
        if not all([question_num, q_data['question'], q_data['options'], q_data['answer']]):
            stats['skipped'] += 1
            continue

        stats['total'] += 1

        # 确定知识点分类
        topic = determine_topic(q_data['question'])

        # 构建题目内容（包含图片附件如果有）
        question_content = q_data['question']
        if q_data['attachment']:
            stats['with_attachment'] += 1
            attachment_url = q_data['attachment']
            question_content += f'\n\n<img src="{attachment_url}" alt="题目附图" class="max-w-full h-auto mt-4 rounded-lg shadow-md">'

        questions.append({
            'id': f"[{question_num}]",
            'topic': topic,
            'content': question_content,
            'options': q_data['options'],
            'answer': q_data['answer'],
            'explanation': '',
            'attachment': q_data['attachment']
        })

    return questions, stats


def parse_txt_to_js(txt_path: str, output_path: Optional[str] = None, class_name: str = 'A') -> str:
    """解析 txt 文件并生成 JavaScript 格式输出"""
    questions, stats = parse_questions(txt_path)

    # 生成 JavaScript 输出
    lines = ["        const questionsData_" + class_name + " = ["]
    for i, q in enumerate(questions):
        line = f"            {json.dumps(q, ensure_ascii=False)}{',' if i < len(questions) - 1 else ''}"
        lines.append(line)
    lines.append("        ];")

    js_output = '\n'.join(lines)

    # 如果指定了输出路径，写入文件
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(js_output)
        print(f"✅ 已写入文件：{output_path}", file=sys.stderr)

    return js_output, stats


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='解析业余无线电题库')
    parser.add_argument('--input', '-i', default='cq_class_A.txt', help='输入 txt 文件路径')
    parser.add_argument('--output', '-o', help='输出 JS 文件路径（可选）')
    parser.add_argument('--class', dest='class_name', default='A', help='题库类别 (A/B/C)')

    args = parser.parse_args()

    if not Path(args.input).exists():
        print(f"❌ 文件不存在：{args.input}", file=sys.stderr)
        sys.exit(1)

    js_output, stats = parse_txt_to_js(args.input, args.output, args.class_name)

    # 输出统计信息
    print(f"✅ 解析完成：共 {stats['total']} 道题目", file=sys.stderr)
    print(f"   - 有附件题目：{stats['with_attachment']} 道", file=sys.stderr)
    print(f"   - 跳过无效：{stats['skipped']} 道", file=sys.stderr)

    # 输出 JavaScript 代码
    # print(js_output)
