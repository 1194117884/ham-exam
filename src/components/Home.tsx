// src/components/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useHamExam } from "../contexts/HamExamContext";

const Home: React.FC = () => {
  const { setCurrentClass, currentClass } = useHamExam();

  const classes = [
    {
      id: "A",
      name: "A类证书",
      desc: "入门、本地通联、手持或车载台爱好者",
      condition: "无",
      hz: "30~3000 MHz范围内的各业余业务和卫星业余业务频段",
      watt: "不大于25瓦",
    },
    {
      id: "B",
      name: "B类证书",
      desc: "需要跨省/跨国远距离通信（DX）的爱好者",
      condition: "持A类证书6个月以上+实际操作经验",
      hz: "所有业余业务和卫星业余业务频段",
      watt: "30 MHz以下频段小于15瓦，30 MHz以上不大于25瓦",
    },
    {
      id: "C",
      name: "C类证书",
      desc: "发烧友、参加竞赛、需要远距离大功率通信的爱好者",
      condition: "持B类证书+电台执照18月以上",
      hz: "所有业余业务和卫星业余业务频段",
      watt: "30 MHz以下频段不大于1000瓦，30 MHz以上不大于25瓦",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Class Selection */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          1.选择证书类别
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => setCurrentClass(cls.id as "A" | "B" | "C")}
              className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                currentClass === cls.id
                  ? "border-blue-500 bg-blue-100 ring-2 ring-blue-300 transform scale-[1.02]"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <h3 className="font-bold text-xl mb-2 text-center">{cls.name}</h3>
              <p className="text-gray-700 mb-3">{cls.desc}</p>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center text-sm">
                  <span className="font-medium text-gray-700 mr-2">
                    报考条件：
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                    {cls.condition}
                  </span>
                </div>
                <div className="flex flex-wrap items-center text-sm">
                  <span className="font-medium text-gray-700 mr-2">
                    可用频段：
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 break-words max-w-full">
                    {cls.hz}
                  </span>
                </div>
                <div className="flex flex-wrap items-center text-sm">
                  <span className="font-medium text-gray-700 mr-2">
                    最大功率：
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 break-words max-w-full">
                    {cls.watt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Options Based on Selected Class */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          2.选择学习模式
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/practice"
            className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center border border-blue-200"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold mb-2">刷题练习</h3>
            <p className="text-gray-600 text-sm">逐题练习，掌握知识点</p>
          </Link>
          <Link
            to="/exam"
            className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center border border-green-200"
          >
            <div className="text-4xl mb-3">⏱️</div>
            <h3 className="text-lg font-semibold mb-2">模拟考试</h3>
            <p className="text-gray-600 text-sm">定时考试，检验学习成果</p>
          </Link>
          <Link
            to="/wrong-book"
            className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center border border-purple-200"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-semibold mb-2">错题本</h3>
            <p className="text-gray-600 text-sm">回顾错题，强化薄弱环节</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
